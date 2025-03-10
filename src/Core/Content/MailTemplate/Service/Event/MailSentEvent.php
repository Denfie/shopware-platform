<?php declare(strict_types=1);

namespace Shopware\Core\Content\MailTemplate\Service\Event;

use Monolog\Logger;
use Shopware\Core\Content\Flow\Dispatching\Aware\ContentsAware;
use Shopware\Core\Content\Flow\Dispatching\Aware\RecipientsAware;
use Shopware\Core\Content\Flow\Dispatching\Aware\SubjectAware;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Event\EventData\ArrayType;
use Shopware\Core\Framework\Event\EventData\EventDataCollection;
use Shopware\Core\Framework\Event\EventData\ScalarValueType;
use Shopware\Core\Framework\Log\LogAware;
use Shopware\Core\Framework\Log\Package;
use Symfony\Contracts\EventDispatcher\Event;

#[Package('sales-channel')]
class MailSentEvent extends Event implements LogAware, SubjectAware, ContentsAware, RecipientsAware
{
    final public const EVENT_NAME = 'mail.sent';

    /**
     * @param array<string, mixed> $recipients
     * @param array<string, mixed> $contents
     */
    public function __construct(
        private readonly string $subject,
        private readonly array $recipients,
        private readonly array $contents,
        private readonly Context $context,
        private readonly ?string $eventName = null
    ) {
    }

    public static function getAvailableData(): EventDataCollection
    {
        return (new EventDataCollection())
            ->add('subject', new ScalarValueType(ScalarValueType::TYPE_STRING))
            ->add('contents', new ScalarValueType(ScalarValueType::TYPE_STRING))
            ->add('recipients', new ArrayType(new ScalarValueType(ScalarValueType::TYPE_STRING)));
    }

    public function getName(): string
    {
        return self::EVENT_NAME;
    }

    public function getContext(): Context
    {
        return $this->context;
    }

    public function getSubject(): string
    {
        return $this->subject;
    }

    /**
     * @return array<string, mixed>
     */
    public function getContents(): array
    {
        return $this->contents;
    }

    /**
     * @return array<string, mixed>
     */
    public function getRecipients(): array
    {
        return $this->recipients;
    }

    /**
     * @return array<string, mixed>
     */
    public function getLogData(): array
    {
        return [
            'eventName' => $this->eventName,
            'subject' => $this->subject,
            'recipients' => $this->recipients,
            'contents' => $this->contents,
        ];
    }

    public function getLogLevel(): int
    {
        return Logger::INFO;
    }
}
