/*
 * @package inventory
 */

import { shallowMount } from '@vue/test-utils';
import swProductDetailBase from 'src/module/sw-product/view/sw-product-detail-base';
import swProductBasicForm from 'src/module/sw-product/component/sw-product-basic-form';
import swInheritWrapper from 'src/app/component/utils/sw-inherit-wrapper';
import swField from 'src/app/component/form/sw-field';
import productStore from 'src/module/sw-product/page/sw-product-detail/state';

const { Utils } = Shopware;

Shopware.Component.register('sw-product-detail-base', swProductDetailBase);
Shopware.Component.register('sw-product-basic-form', swProductBasicForm);
Shopware.Component.register('sw-inherit-wrapper', swInheritWrapper);
Shopware.Component.register('sw-field', swField);

async function createWrapper() {
    return shallowMount(await Shopware.Component.build('sw-product-detail-base'), {
        stubs: {
            'sw-page': {
                template: `
                    <div class="sw-page">
                        <slot name="smart-bar-actions"></slot>
                        <slot name="content">CONTENT</slot>
                        <slot></slot>
                    </div>`
            },
            'sw-product-detail-base__review-card': true,
            'sw-data-grid': {
                props: ['dataSource'],
                template: `
                    <div>
                        <template v-for="item in dataSource">
                            <slot name="actions" v-bind="{ item }"></slot>
                        </template>
                    </div>`
            },
            'sw-product-category-form': true,
            'sw-product-deliverability-form': true,
            'sw-product-deliverability-downloadable-form': true,
            'sw-product-download-form': true,
            'sw-product-price-form': true,
            'sw-product-basic-form': await Shopware.Component.build('sw-product-basic-form'),
            'sw-product-feature-set-form': true,
            'sw-product-settings-form': true,
            'sw-inherit-wrapper': await Shopware.Component.build('sw-inherit-wrapper'),
            'sw-empty-state': true,
            'sw-card': {
                template: '<div><slot></slot><slot name="grid"></slot></div>'
            },
            'sw-context-menu-item': true,
            'sw-media-modal-v2': true,
            'sw-container': true,
            'sw-field': await Shopware.Component.build('sw-field'),
            'sw-text-editor': true,
            'sw-switch-field': true,
            'sw-product-media-form': true,
            'sw-entity-single-select': true,
            'sw-help-text': true,
            'sw-icon': true,
            'sw-text-field': true,
            'sw-select-field': true,
            'router-link': true,
            'sw-skeleton': true,
        },
        mocks: {
            $route: {
                name: 'sw.product.detail.base',
                params: {
                    id: '1234'
                }
            }
        },
        provide: {
            repositoryFactory: {
                create: () => ({
                    search: () => Promise.resolve({
                        first: () => {
                            return {
                                folder: {}
                            };
                        }
                    }),
                    get: () => Promise.resolve({}),
                    searchIds: () => Promise.resolve({
                        data: []
                    })
                })
            },
        }
    });
}

describe('src/module/sw-product/view/sw-product-detail-base', () => {
    beforeEach(() => {
        if (Shopware.State.get('swProductDetail')) {
            Shopware.State.unregisterModule('swProductDetail');
        }

        Shopware.State.registerModule('swProductDetail', {
            ...productStore,
            state: {
                ...productStore.state,
                parentProduct: {
                    media: [],
                    reviews: [{
                        id: '1a2b3c',
                        entity: 'review',
                        customerId: 'd4c3b2a1',
                        productId: 'd4c3b2a1',
                        salesChannelId: 'd4c3b2a1'
                    }]
                },
                product: {
                    getEntityName: () => 'product',
                    isNew: () => false,
                    media: [],
                    reviews: [{
                        id: '1a2b3c',
                        entity: 'review',
                        customerId: 'd4c3b2a1',
                        productId: 'd4c3b2a1',
                        salesChannelId: 'd4c3b2a1'
                    }],
                    purchasePrices: [{
                        currencyId: '1',
                        linked: true,
                        gross: 0,
                        net: 0
                    }],
                    price: [{
                        currencyId: '1',
                        linked: true,
                        gross: 100,
                        net: 84.034
                    }]
                },
                loading: {
                    product: false,
                    media: false
                },
                modeSettings: [
                    'general_information',
                    'prices',
                    'deliverability',
                    'visibility_structure',
                    'media',
                    'labelling'
                ],
                advancedModeSetting: {
                    value: {
                        settings: [
                            {
                                key: 'general_information',
                                label: 'sw-product.detailBase.cardTitleProductInfo',
                                enabled: true,
                                name: 'general'
                            },
                            {
                                key: 'prices',
                                label: 'sw-product.detailBase.cardTitlePrices',
                                enabled: true,
                                name: 'general'
                            },
                            {
                                key: 'deliverability',
                                label: 'sw-product.detailBase.cardTitleDeliverabilityInfo',
                                enabled: true,
                                name: 'general'
                            },
                            {
                                key: 'visibility_structure',
                                label: 'sw-product.detailBase.cardTitleVisibilityStructure',
                                enabled: true,
                                name: 'general'
                            },
                            {
                                key: 'labelling',
                                label: 'sw-product.detailBase.cardTitleSettings',
                                enabled: true,
                                name: 'general'
                            }
                        ],
                        advancedMode: {
                            enabled: true,
                            label: 'sw-product.general.textAdvancedMode'
                        }
                    }
                },
                creationStates: 'is-physical'
            }
        });
    });

    it('should be a Vue.JS component', async () => {
        const wrapper = await createWrapper();
        expect(wrapper.vm).toBeTruthy();
    });

    it('should not show files card when product states not includes is-download', async () => {
        const wrapper = await createWrapper();

        await Shopware.State.commit('swProductDetail/setProduct', {
            ...Utils.get(wrapper, 'vm.$store.state.swProductDetail.product'),
            states: [
                'is-physical'
            ],
        });

        await wrapper.vm.$nextTick();

        const cardElement = wrapper.find('.sw-product-detail-base__downloads');
        const cardStyles = cardElement.attributes('style');

        expect(cardStyles).toBe('display: none;');
    });

    it('should show files card when product states includes is-download', async () => {
        const wrapper = await createWrapper();

        await Shopware.State.commit('swProductDetail/setProduct', {
            ...Utils.get(wrapper, 'vm.$store.state.swProductDetail.product'),
            states: [
                'is-download'
            ],
        });

        await wrapper.vm.$nextTick();

        const cardElement = wrapper.find('.sw-product-detail-base__downloads');
        expect(cardElement).toBeTruthy();
    });

    it('should show correct deliverability card when product states includes is-download', async () => {
        const wrapper = await createWrapper();

        await Shopware.State.commit('swProductDetail/setProduct', {
            ...Utils.get(wrapper, 'vm.$store.state.swProductDetail.product'),
            states: [
                'is-download'
            ],
        });

        await wrapper.vm.$nextTick();

        const physicalCardElement = wrapper.find('.sw-product-detail-base__deliverability');
        expect(physicalCardElement.exists()).toBeFalsy();

        const cardElement = wrapper.find('.sw-product-detail-base__deliverability-downloadable');
        expect(cardElement).toBeTruthy();

        await Shopware.State.commit('swProductDetail/setProduct', {
            ...Utils.get(wrapper, 'vm.$store.state.swProductDetail.product'),
            states: [
                'is-physical'
            ],
        });
    });

    it('should get media default folder id when component got created', async () => {
        const wrapper = await createWrapper();
        await wrapper.vm.$nextTick();

        wrapper.vm.getMediaDefaultFolderId = jest.fn(() => {
            return Promise.resolve('SOME-ID');
        });

        wrapper.vm.createdComponent();

        expect(wrapper.vm.getMediaDefaultFolderId).toHaveBeenCalledTimes(1);
        wrapper.vm.getMediaDefaultFolderId.mockRestore();
    });

    it('should turn on media modal', async () => {
        const wrapper = await createWrapper();
        await wrapper.vm.$nextTick();

        await wrapper.setData({
            showMediaModal: true
        });

        const mediaModal = wrapper.find('sw-media-modal-v2-stub');

        expect(mediaModal.exists()).toBeTruthy();
        expect(mediaModal.attributes('entity-context')).toBe('product');
    });

    it('should turn off media modal', async () => {
        const wrapper = await createWrapper();
        await wrapper.vm.$nextTick();

        await wrapper.setData({
            showMediaModal: false
        });

        const mediaModal = wrapper.find('sw-media-modal-v2-stub');

        expect(mediaModal.exists()).toBeFalsy();
    });

    it('should be able to add a new media', async () => {
        const wrapper = await createWrapper();
        await wrapper.vm.$nextTick();

        wrapper.vm.addMedia = jest.fn(() => Promise.resolve());

        const media = { id: 'id', fileName: 'fileName', fileSize: 101 };
        await wrapper.vm.onAddMedia([media]);
        await wrapper.setData({
            product: {
                media: [
                    media
                ]
            }
        });

        expect(wrapper.vm.addMedia).toHaveBeenCalledWith(media);
        expect(wrapper.vm.product.media).toEqual(expect.arrayContaining([media]));

        wrapper.vm.addMedia.mockRestore();
    });

    it('should not be able to add a new media', async () => {
        const wrapper = await createWrapper();
        await wrapper.vm.$nextTick();

        const media = { id: 'id', fileName: 'fileName', fileSize: 101 };

        wrapper.vm.addMedia = jest.fn(() => Promise.reject(media));
        wrapper.vm.createNotificationError = jest.fn();

        await wrapper.vm.onAddMedia([media]);

        expect(wrapper.vm.addMedia).toHaveBeenCalledWith(media);
        expect(wrapper.vm.createNotificationError).toHaveBeenCalledWith({
            message: 'sw-product.mediaForm.errorMediaItemDuplicated'
        });

        wrapper.vm.addMedia.mockRestore();
        wrapper.vm.createNotificationError.mockRestore();
    });

    it('should set media as cover', async () => {
        const wrapper = await createWrapper();
        await wrapper.vm.$nextTick();

        const media = { id: 'id', fileName: 'fileName', fileSize: 101 };

        await wrapper.vm.setMediaAsCover(media);

        expect(wrapper.vm.product.coverId).toBe(media.id);
    });

    it('should show Promotion Switch of General card when advanced mode is on', async () => {
        const wrapper = await createWrapper();

        const promotionSwitch = wrapper.find('.sw-product-basic-form__promotion-switch');
        expect(promotionSwitch.attributes().style).toBeFalsy();
    });

    it('should show Labelling card when advanced mode is on', async () => {
        const wrapper = await createWrapper();

        const labellingCardElement = wrapper.find('.sw-product-detail-base__labelling-card');
        expect(labellingCardElement.attributes().style).toBeFalsy();
    });

    it('should show Media card when media mode is checked', async () => {
        const wrapper = await createWrapper();

        const mediaCardElement = wrapper.find('.sw-product-detail-base__media');
        expect(mediaCardElement.attributes().style).toBeFalsy();
    });

    it('should hide Promotion Switch when advanced mode is off', async () => {
        const wrapper = await createWrapper();
        const advancedModeSetting = Utils.get(wrapper, 'vm.$store.state.swProductDetail.advancedModeSetting');

        Shopware.State.commit('swProductDetail/setAdvancedModeSetting', {
            value: {
                ...advancedModeSetting.value,
                advancedMode: {
                    enabled: false,
                    label: 'sw-product.general.textAdvancedMode'
                }
            }
        });

        await wrapper.vm.$nextTick();

        const promotionSwitch = wrapper.find('.sw-product-basic-form__promotion-switch');
        expect(promotionSwitch.attributes().style).toBe('display: none;');
    });

    it('should hide Labelling card when commit when advanced mode is off', async () => {
        const wrapper = await createWrapper();
        const advancedModeSetting = Utils.get(wrapper, 'vm.$store.state.swProductDetail.advancedModeSetting');

        Shopware.State.commit('swProductDetail/setAdvancedModeSetting', {
            value: {
                ...advancedModeSetting.value,
                advancedMode: {
                    enabled: false,
                    label: 'sw-product.general.textAdvancedMode'
                }
            }
        });

        await wrapper.vm.$nextTick();

        const labellingCardElement = wrapper.find('.sw-product-detail-base__labelling-card');
        expect(labellingCardElement.attributes().style).toBe('display: none;');
    });

    it('should hide Media card when media mode is unchecked', async () => {
        const wrapper = await createWrapper();
        const modeSettings = Utils.get(wrapper, 'vm.$store.state.swProductDetail.modeSettings');

        Shopware.State.commit('swProductDetail/setModeSettings', [
            ...modeSettings.filter(item => item !== 'media')
        ]);

        await wrapper.vm.$nextTick();

        const mediaCardElement = wrapper.find('.sw-product-detail-base__media');
        expect(mediaCardElement.attributes().style).toBe('display: none;');
    });

    it('should hide General card when general_information mode is unchecked', async () => {
        const wrapper = await createWrapper();
        const modeSettings = Utils.get(wrapper, 'vm.$store.state.swProductDetail.modeSettings');

        Shopware.State.commit('swProductDetail/setModeSettings', [
            ...modeSettings.filter(item => item !== 'general_information')
        ]);

        await wrapper.vm.$nextTick();

        const infoCardElement = wrapper.find('.sw-product-detail-base__info');
        expect(infoCardElement.attributes().style).toBe('display: none;');
    });

    it('should hide Prices card when prices mode is unchecked', async () => {
        const wrapper = await createWrapper();
        const modeSettings = Utils.get(wrapper, 'vm.$store.state.swProductDetail.modeSettings');

        Shopware.State.commit('swProductDetail/setModeSettings', [
            ...modeSettings.filter(item => item !== 'prices')
        ]);

        await wrapper.vm.$nextTick();

        const infoCardElement = wrapper.find('.sw-product-detail-base__prices');
        expect(infoCardElement.attributes().style).toBe('display: none;');
    });

    it('should hide Deliverability card when deliverability mode is unchecked', async () => {
        const wrapper = await createWrapper();
        const modeSettings = Utils.get(wrapper, 'vm.$store.state.swProductDetail.modeSettings');

        Shopware.State.commit('swProductDetail/setModeSettings', [
            ...modeSettings.filter(item => item !== 'deliverability')
        ]);

        await wrapper.vm.$nextTick();

        const infoCardElement = wrapper.find('.sw-product-detail-base__deliverability');
        expect(infoCardElement.attributes().style).toBe('display: none;');
    });

    it('should hide Visibility Structure card when prices mode is unchecked', async () => {
        const wrapper = await createWrapper();
        const modeSettings = Utils.get(wrapper, 'vm.$store.state.swProductDetail.modeSettings');

        Shopware.State.commit('swProductDetail/setModeSettings', [
            ...modeSettings.filter(item => item !== 'visibility_structure')
        ]);

        await wrapper.vm.$nextTick();

        const infoCardElement = wrapper.find('.sw-product-detail-base__visibility-structure');
        expect(infoCardElement.attributes().style).toBe('display: none;');
    });
});
