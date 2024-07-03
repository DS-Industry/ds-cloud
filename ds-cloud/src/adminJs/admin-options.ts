import {IntegrationModel} from "@/app/integrations/schema/integration.schema";
import {PriceModel} from "@/app/price/schema/price.schema";
import {BrandModel} from "@/app/brand/schema/brand.schema";
import {CollectionModel} from "@/app/collection/Schema/collection.schema";
import {ServiceModel} from "@/app/services/schema/service.schema";
import {TagModel} from "@/app/tags/Schema/tags.schema";
import {DeviceModel} from "@/device/schema/device.schema";
import {UserModel} from "@/user/schema/user.schema";
import {VariableModel} from "@/variable/schema/variable.schema";
import {UserJsModel} from "@/adminJs/userAdminJs";
import * as bcrypt from "bcryptjs";

const canModifyUsers = ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
const adminOptions = {
    resources: [
        IntegrationModel,
        {resource: PriceModel,
            options: {
                properties: {
                    costType:{
                        isTitle: false,
                        isRequired: false,
                    },
                    service:{
                        isRequired: true,
                    },
                    collectionId: {
                        description: 'Id - как в CW',
                    },
                    _id: {
                        isTitle: true,
                    },

                }
            }
        },
        BrandModel,
        {resource: CollectionModel,
            options: {
                properties: {
                    owner: {
                        isRequired: true,
                    },
                    identifier: {
                        description: 'Id - как в CW',
                    },
                    address: {
                        isRequired: true,
                    },
                    lat: {
                        isRequired: true,
                        description: 'Широта',
                    },
                    lon: {
                        isRequired: true,
                        description: 'Долгота',
                    },
                }
            }
        },
        ServiceModel,
        TagModel,
        {resource: DeviceModel,
            options: {
                properties: {
                    name: {
                        isRequired: true,
                        isTitle: false,
                    },
                    identifier: {
                        isRequired: true,
                        isTitle: true,
                        description: 'Id - как в CW',
                    },
                    bayNumber: {
                        isRequired: true,
                    },
                    owner: {
                        isRequired: true,
                        description: 'Мойка',
                    },
                }
            }
        },
        UserModel,
        { resource:VariableModel,
            options: {
                properties: {
                    name: {
                        isTitle: false,
                        availableValues: [
                            { value: 'GVLSum', label: 'GVLSum' },
                            { value: 'GVLErr', label: 'GVLErr' },
                            { value: 'GVLCardNum', label: 'GVLCardNum' },
                            { value: 'GVLCardSum', label: 'GVLCardSum' },
                            { value: 'GVLTime', label: 'GVLTime' },
                            { value: 'GVLSource', label: 'GVLSource' },
                        ],
                    },
                    _id: {
                        isTitle: true,
                    },
                }
            }
        },
        { resource: UserJsModel,
            options: {
                properties: {
                    encryptedPassword: {
                        isVisible: false,
                    },
                    password: {
                        type: 'string',
                        isVisible: {
                            list: false, edit: true, filter: false, show: false,
                        },
                    },
                },
                actions: {
                    new: {
                        isAccessible: canModifyUsers,
                        isVisible: canModifyUsers,
                        before: async (request) => {
                            if(request.payload.password) {
                                request.payload = {
                                    ...request.payload,
                                    encryptedPassword: await bcrypt.hash(request.payload.password, 10),
                                    password: undefined,
                                }
                            }
                            return request
                        },
                    },
                    edit: { isAccessible: canModifyUsers, isVisible: canModifyUsers},
                    delete: { isAccessible: canModifyUsers, isVisible: canModifyUsers},
                    show: { isAccessible: canModifyUsers, isVisible: canModifyUsers},
                    bulkDelete: { isAccessible: canModifyUsers, isVisible: canModifyUsers},
                },
            }
        }
    ],
    rootPath: '/admin',
}

module.exports = adminOptions;