<?php declare(strict_types=1);

namespace Shopware\Storefront\Theme\Subscriber;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Plugin\PluginLifecycleService;
use Shopware\Core\Framework\Update\Event\UpdatePostFinishEvent;
use Shopware\Core\System\SalesChannel\SalesChannelEntity;
use Shopware\Storefront\Theme\ThemeCollection;
use Shopware\Storefront\Theme\ThemeLifecycleService;
use Shopware\Storefront\Theme\ThemeService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * @deprecated tag:v6.5.0 - reason:becomes-internal - EventSubscribers will become internal in v6.5.0
 */
class UpdateSubscriber implements EventSubscriberInterface
{
    private ThemeService $themeService;

    private ThemeLifecycleService $themeLifecycleService;

    private EntityRepository $salesChannelRepository;

    /**
     * @internal
     */
    public function __construct(
        ThemeService $themeService,
        ThemeLifecycleService $themeLifecycleService,
        EntityRepository $salesChannelRepository
    ) {
        $this->themeService = $themeService;
        $this->themeLifecycleService = $themeLifecycleService;
        $this->salesChannelRepository = $salesChannelRepository;
    }

    /**
     * @return array<string, string|array{0: string, 1: int}|list<array{0: string, 1?: int}>>
     */
    public static function getSubscribedEvents()
    {
        return [
            UpdatePostFinishEvent::class => 'updateFinished',
        ];
    }

    /**
     * @internal
     */
    public function updateFinished(UpdatePostFinishEvent $event): void
    {
        $context = $event->getContext();
        $this->themeLifecycleService->refreshThemes($context);

        if ($context->hasState(PluginLifecycleService::STATE_SKIP_ASSET_BUILDING)) {
            return;
        }

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('active', true));
        $criteria->getAssociation('themes')
            ->addFilter(new EqualsFilter('active', true));

        $alreadyCompiled = [];
        /** @var SalesChannelEntity $salesChannel */
        foreach ($this->salesChannelRepository->search($criteria, $context) as $salesChannel) {
            $themes = $salesChannel->getExtension('themes');
            if (!$themes instanceof ThemeCollection) {
                continue;
            }

            foreach ($themes as $theme) {
                // NEXT-21735 - his is covered randomly
                // @codeCoverageIgnoreStart
                if (\in_array($theme->getId(), $alreadyCompiled, true) !== false) {
                    continue;
                }
                // @codeCoverageIgnoreEnd

                $alreadyCompiled += $this->themeService->compileThemeById($theme->getId(), $context);
            }
        }
    }
}
