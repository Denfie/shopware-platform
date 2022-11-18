<?php declare(strict_types=1);

namespace Shopware\Tests\Unit\Core\Content\Flow\Dispatching\Action;

use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Content\Flow\Dispatching\Action\ChangeCustomerGroupAction;
use Shopware\Core\Content\Flow\Dispatching\StorableFlow;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Event\CustomerAware;
use Shopware\Core\Framework\Feature;
use Shopware\Core\Framework\Uuid\Uuid;

/**
 * @internal
 * @covers \Shopware\Core\Content\Flow\Dispatching\Action\ChangeCustomerGroupAction
 */
class ChangeCustomerGroupActionTest extends TestCase
{
    /**
     * @var MockObject|EntityRepository
     */
    private $repository;

    private ChangeCustomerGroupAction $action;

    /**
     * @var MockObject|StorableFlow
     */
    private $flow;

    public function setUp(): void
    {
        $this->repository = $this->createMock(EntityRepository::class);
        $this->action = new ChangeCustomerGroupAction($this->repository);

        $this->flow = $this->createMock(StorableFlow::class);
    }

    public function testRequirements(): void
    {
        static::assertSame(
            [CustomerAware::class],
            $this->action->requirements()
        );
    }

    public function testSubscribedEvents(): void
    {
        if (Feature::isActive('v6.5.0.0')) {
            static::assertSame(
                [],
                ChangeCustomerGroupAction::getSubscribedEvents()
            );

            return;
        }

        static::assertSame(
            ['action.change.customer.group' => 'handle'],
            ChangeCustomerGroupAction::getSubscribedEvents()
        );
    }

    public function testName(): void
    {
        static::assertSame('action.change.customer.group', ChangeCustomerGroupAction::getName());
    }

    public function testActionExecuted(): void
    {
        $groupId = Uuid::randomHex();
        $config = ['customerGroupId' => $groupId];

        $this->flow->expects(static::exactly(2))->method('getStore')->willReturn(Uuid::randomHex());
        $this->flow->expects(static::once())->method('hasStore')->willReturn(true);
        $this->flow->expects(static::once())->method('getConfig')->willReturn($config);

        $this->repository->expects(static::once())
            ->method('update')
            ->with([['id' => $this->flow->getStore('customerId'), 'groupId' => $groupId]]);

        $this->action->handleFlow($this->flow);
    }

    public function testActionWithNotAware(): void
    {
        $this->flow->expects(static::once())->method('hasStore')->willReturn(false);
        $this->flow->expects(static::never())->method('getStore');
        $this->repository->expects(static::never())->method('update');

        $this->action->handleFlow($this->flow);
    }

    public function testActionWithEmptyConfig(): void
    {
        $this->flow->expects(static::once())->method('hasStore')->willReturn(true);
        $this->flow->expects(static::exactly(1))->method('getStore')->willReturn(Uuid::randomHex());
        $this->flow->expects(static::once())->method('getConfig')->willReturn([]);
        $this->repository->expects(static::never())->method('update');

        $this->action->handleFlow($this->flow);
    }
}
