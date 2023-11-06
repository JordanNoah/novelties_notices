import * as Repository from 'block_novelties_notices/repository';
import Ajax from 'core/ajax';

export const init = () => {

    // eslint-disable-next-line no-undef
        new Vue({
        el: '#block_novelties_notices',
        // eslint-disable-next-line no-undef
        vuetify: new Vuetify(),
        data: {
            // Recolecion de data no limpiada
            novelties: null,
            alertsConfigs: null,
            alerts: [],
            langKeys: [],
            // Renderizado final,
            dataToRender: [],
            // Variables de la aplicacion/bloque
            tab: null
        },
        methods: {
            async getLangsKey() {
                var langskeys = null;
                // Chequeamos si existe dentro de la variable global M
                // si no existe mandamos a hacer la peticion caso contrario tomamos lo que ya existe
                if (!M.hasOwnProperty("plugins")) {
                    var response = await Ajax.call([{
                        methodname: 'local_alerts_front_get_langs',
                        args: {}
                    }])[0];
                    langskeys = JSON.parse(response.lang);
                } else {
                    // eslint-disable-next-line no-console
                    langskeys = M.plugins.courseView.langsKeys;
                }
                this.langKeys = langskeys;
            },
            async getNovelties() {
                let args = {
                    course_id: M.cfg.courseId == 1 ? null : M.cfg.courseId
                    // Limit: models.limit
                };

                let novelties = await Repository.getNovelties(args);

                for (let i = 0; i < novelties.length; i++) {
                    novelties[i].is_active = i === 0;
                    novelties[i].is_novelty = true;
                }

                this.novelties = novelties;
            },
            async getAlertsConfigs() {
                var configskeys = null;
                // Chequeamos si existe dentro de la variable global M
                // si no existe mandamos a hacer la peticion caso contrario tomamos lo que ya existe
                if (!M.hasOwnProperty("plugins")) {
                    var response = await Ajax.call([{
                        methodname: 'local_alerts_front_get_configs',
                        args: {
                            userid: M.cfg.contextInstanceId
                        }
                    }])[0];
                    configskeys = JSON.parse(response.configs);
                } else {
                    // eslint-disable-next-line no-console
                    configskeys = M.plugins.courseView.configs;
                }
                this.alertsConfigs = configskeys;
            },
            async getAlerts() {
                var params = new URLSearchParams();
                params.set('userid', this.alertsConfigs.user_id);
                params.set('institution', this.alertsConfigs.institution);
                params.set('modality', this.alertsConfigs.modality);
                params.set('courseid', M.cfg.courseId);

                var fetchurl = `${this.alertsConfigs.urlapi}/notices?${params.toString()}`;

                var response = await fetch(`${fetchurl}`).catch(function() {
                    return undefined;
                });

                if (response !== undefined && response.status !== 404) {
                    this.alerts = await response.json();
                }
            },
            orderTopics(noveltiesTopic, alertsTopic) {
                const orderTopics = [
                    'forum_news',
                    'overdue_activities',
                    'activities_course_soon_close',
                    'corrected_activities',
                    'direct_response_forum',
                    'new_activities',
                    'direct_message_teacher'
                ];

                var actualTopics = noveltiesTopic.concat(alertsTopic);

                // Limpia cualquier null que me pueda generar el mapeo

                actualTopics = actualTopics.filter(n => n);

                // eslint-disable-next-line max-len
                return actualTopics.sort(
                    (a, b) => orderTopics.indexOf(a.abbreviation) - orderTopics.indexOf(b.abbreviation)
                );
            },
            fusionAlertAndNovelties() {
                this.dataToRender = this.alerts;
                this.dataToRender = this.dataToRender.concat(this.novelties);
            },
            cleanDataToRender() {
                var newRenderBase = [];
                // eslint-disable-next-line no-console
                for (let i = 0; i < this.dataToRender.length; i++) {
                    let element = this.dataToRender[i];
                    var object = {};

                    object.abbreviation = element.abbreviation;
                    object.count = element.count || element.count_notices;
                    object.description = this.getDescriptionString(element);
                    object.icon = element.icon;
                    object.id = element.id;
                    object.permanent = element.is_permanent || false;
                    object.langkey = element.lang_key;
                    object.name = element.name;
                    object.notices = element.notices || element.novelties;
                    object.isNovelty = element.is_novelty || false;

                    var arraynoticesmapped = [];

                    for (let j = 0; j < object.notices.length; j++) {
                        var elementnotices = object.notices[j];

                        var noticesObj = {};
                        noticesObj.id = elementnotices.id;
                        noticesObj.title = this.getTitleString(elementnotices, element);
                        noticesObj.detail = this.getDetailString(elementnotices, element);
                        noticesObj.icon = this.getIcon(elementnotices, element);
                        noticesObj.viewed = elementnotices.is_view;
                            noticesObj.url = elementnotices.url || false;
                            // NoticesObj.detailCounter = this.getDetailCounter(elementnotices,element);
                        arraynoticesmapped.push(noticesObj);
                    }

                    object.notices = arraynoticesmapped;

                    if (object.count > 0) {
                        newRenderBase.push(object);
                    }
                }

                this.dataToRender = newRenderBase;
            },
            getDetailCounter(element, elementParent) {
                if (elementParent.is_novelty) {
                    return false;
                } else {
                    return element.title.value;
                }
            },
            getIcon(element, elementParent) {
                if (elementParent.is_novelty) {
                    return element.icon;
                } else {
                    // eslint-disable-next-line no-console
                    return elementParent.icon;
                }
            },
            getDescriptionString(element) {
                if (element.description === 'lang.ac_son_close_desc') {
                    return this.langKeys.about_to_close_block_description;
                } else if (element.description === 'lang.overdue_activities_desc') {
                    return this.langKeys.overdue_activity_block_description;
                } else if (element.description === 'lang.ac_direct_message_desc') {
                    return this.langKeys.not_read_message_block_description;
                } else if (element.is_novelty) {
                    return element.description;
                } else {
                    return '';
                }
            },
            getTitleString(element, elementParent) {
                if (elementParent.is_novelty) {
                    return element.title;
                } else {
                    return element.detail;
                }
            },
            getDetailString(element, elementParent) {
                if (elementParent.is_novelty) {
                    return `${element.message}`;
                } else {
                    return `${this.langKeys[element.title.lang_key]} ${element.title.value}`;
                }
            },
            getIconImage(element) {
                return M.util.image_url(element.icon.key, element.icon.component);
            },
            async markasview(element, elementParent) {
                var error = false;
                if (!elementParent.permanent){
                    if(elementParent.isNovelty){
                        let args = {
                            novelty_id: element.id,
                            type_novelty: elementParent.abbreviation
                        };

                        var request = await Repository.markedAsRead(args);
                        if(!request.is_view){
                            error = true;
                        }
                    } else {
                        var fetchUrl = `${this.alertsConfigs.urlapi}/notices/${element.id}/marked-viewed`;
                        var request = await fetch(fetchUrl, {
                            method: 'PUT'
                        });

                        if (request.status !== 204) {
                            error = true;
                        }
                    }

                    if(!error){
                        var indexParent = this.dataToRender.findIndex((x) => {
                            return x.abbreviation === elementParent.abbreviation;
                        });

                        if (indexParent > -1){
                            var indexNotices = this.dataToRender[indexParent].notices.findIndex((x) => {
                                return x.id === element.id;
                            });

                            this.dataToRender[indexParent].notices.splice(indexNotices, 1);

                            // eslint-disable-next-line max-depth
                            if (this.dataToRender[indexParent].notices.length === 0) {
                                this.dataToRender.splice(indexParent, 1);
                            }
                        }
                    }
                }
            }
        },
        mounted: async function() {
            await this.getLangsKey();
            await this.getNovelties();
            await this.getAlertsConfigs();
            await this.getAlerts();
            await this.fusionAlertAndNovelties();
            await this.cleanDataToRender();
        },
        template: `
            <v-app>
                <v-main>
                    <v-tabs center-active show-arrows v-model="tab" grow>
                        <v-tab v-for="i in dataToRender" :key="i.abbreviation">
                            {{i.name}}
                            <v-badge inline :content="i.notices.length">
                            </v-badge>
                        </v-tab>
                    </v-tabs>
                    <v-divider class="ma-0"></v-divider>
                    <v-tabs-items v-model="tab">
                        <v-tab-item v-for="i in dataToRender" :key="i.abbreviation">
                            <div class="pt-2">
                                <div class="font-weight-bold">
                                    {{i.description}}
                                </div>
                                <div class="my-2 mx-1" style="max-height: 190px; overflow-y: auto;">
                                    <v-hover v-slot="{ hover }" v-for="j in i.notices" :key="j.id">
                                        <v-card class="mb-1 mr-1 d-flex pa-2" flat 
                                        :color="hover ? '#f8f9fa' : ''"
                                        >
                                            <div class="d-flex flex-grow-1">
                                            <a :href="j.url ? j.url:'#'" class="d-flex flex-grow-1">
                                                <div class="d-flex align-center">
                                                    <div v-if="i.isNovelty"
                                                        class="activityiconcontainer 
                                                        assessment 
                                                        collaboration 
                                                        icon_novelties_alerts
                                                        pa-1
                                                        courseicon mr-3"
                                                        :class="j.purpose">
                                                        <v-img :src="getIconImage(j)" class="activityicon"></v-img>    
                                                    </div>
                                                    <div class="activityiconcontainer
                                                    assessment
                                                    collaboration
                                                    icon_novelties_alerts
                                                    pa-1
                                                    courseicon mr-3 activityicon
                                                    " v-else v-html="j.icon">
                                                    </div>
                                                </div>
                                                <div>
                                                    <div v-html="j.title" class="
                                                        font-weight-bold
                                                        primary--text
                                                    "></div>
                                                    <div v-html="j.detail" class="
                                                        d-flex align-center 
                                                        font-weight-medium
                                                        primary--text
                                                        text-body-2
                                                    "></div>
                                                </div>
                                            </a>
                                            </div>
                                            <div v-if="!i.permanent" class="d-flex align-center justify-center"
                                            style="text-decoration: none"
                                            >
                                                <v-btn icon @click="markasview(j,i)">
                                                    <v-icon>
                                                        mdi-eye
                                                    </v-icon>
                                                </v-btn>
                                            </div>                                        
                                        </v-card>
                                    </v-hover>
                                </div>
                            </div>
                        </v-tab-item>
                    </v-tabs-items>
                </v-main>
            </v-app>
        `
    });
};