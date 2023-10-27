import * as Repository from 'block_novelties_notices/repository';
import Ajax from 'core/ajax';

export const init = () => {

        new Vue({
        el: '#block_novelties_notices',
        vuetify: new Vuetify(),
        data: {
            //recolecion de data no limpiada
            novelties: null,
            alertsConfigs: null,
            alerts: null,
            langKeys: [],
            //renderizado final,
            topicsToRender: [],
            containerToRender:[],
            //variables de la aplicacion/bloque
            tab:null
        },
        methods: {
            async getLangsKey(){
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
            async mapTabsTopics() {
                var containerToRender = [];

                var mappedTopicsNovelties = this.novelties.map(
                    function(e) {
                        var topicObj = {};
                        topicObj.abbreviation = e.abbreviation;
                        topicObj.name = e.name;
                        topicObj.count = e.novelties.length;
                        return topicObj;
                    }
                );

                if (this.alerts !== undefined) {

                    // Await deleteTabChildren();
                    let mappedTopicsAlerts = [];

                    for (let i = 0; i < this.alerts.length; i++) {
                        let e = this.alerts[i];
                        if(e.notices.length){
                            var topicObj = {};
                            topicObj.abbreviation = e.abbreviation;
                            topicObj.name = this.langKeys[e.lang_key];
                            topicObj.count = e.notices.length;
                            topicObj.permanent = 'dimisible';
                            topicObj.isPermanent = false;
                            mappedTopicsAlerts.push(topicObj);
                        }
                    }

                    let mappedAlertToNovelties = [];

                    for (let i = 0; i < this.alerts.length; i++) {
                        let e = this.alerts[i];
                        if (e.count_notices > 0) {
                            var alertsObj = {};
                            alertsObj.abbreviation = e.abbreviation;
                            alertsObj.name = this.langKeys[e.notices[0].title.lang_key];
                            alertsObj.count = e.notices.length;
                            alertsObj.id = e.id;
                            // Logica aparte para la descripcion de cada bloque
                            if (e.lang_key === "lang.ac_son_close") {
                                alertsObj.description = this.langKeys.about_to_close_block_description;
                            } else if (e.lang_key === "lang.overdue_activities") {
                                alertsObj.description = this.langKeys.overdue_activity_block_description;
                            } else if (e.lang_key === "lang.ac_direct_message") {
                                alertsObj.description = this.langKeys.not_read_message_block_description;
                            } else {
                                alertsObj.description = "Description not found";
                            }
                            alertsObj.novelties = e.notices;
                            alertsObj.icon = e.icon;
                            alertsObj.type = 'alert';
                            alertsObj.permanent = e.is_permanent ? 'permanent' : 'dimisible';
                            alertsObj.isPermanent = e.is_permanent;
                            mappedAlertToNovelties.push(alertsObj);
                        }
                    }

                    var topics = await this.orderTopics(mappedTopicsNovelties, mappedTopicsAlerts);

                    this.topicsToRender = topics;
                    containerToRender = this.novelties.concat(mappedAlertToNovelties);
                } else {
                    this.topicsToRender = mappedTopicsNovelties;
                    // eslint-disable-next-line no-unused-vars
                    containerToRender = this.novelties;
                }
                this.containerToRender = containerToRender;
            },
            orderTopics(noveltiesTopic, alertsTopic){
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
            }
        },
        mounted: async function() {
            await this.getLangsKey();
            await this.getNovelties();
            await this.getAlertsConfigs();
            await this.getAlerts();
            this.mapTabsTopics();
        },
        template: `
            <v-app>
                <v-main>
                    <v-tabs center-active show-arrows v-model="tab">
                        <v-tab v-for="i in topicsToRender" :key="i.abbreviation">
                            {{i.name}}
                            <v-badge inline :content="i.count">
                            </v-badge>
                        </v-tab>
                    </v-tabs>
                    
                    <v-tabs-items v-model="tab">
                        <v-tab-item v-for="i in containerToRender">
                            {{i}}
                        </v-tab-item>
                    </v-tabs-items>
                </v-main>
            </v-app>
        `
    });
};