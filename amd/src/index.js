export const init = () => {

    Vue.component('novelties_notices_tabs',{
        template:`
        <div>prb</div>
        `
    })



    var app = new Vue({
        el: '#block_novelties_notices',
        vuetify: new Vuetify(),
        data: {
            message:'prueba'
        },
        template:`
            <v-app>
                <v-main>
                    <v-tabs center-active show-arrows>
                        <v-tab>One</v-tab>
      <v-tab>Two</v-tab>
      <v-tab>Three</v-tab>
      <v-tab>Four</v-tab>
      <v-tab>Five</v-tab>
      <v-tab>Six</v-tab>
      <v-tab>Seven</v-tab>
      <v-tab>Eight</v-tab>
      <v-tab>Nine</v-tab>
      <v-tab>Ten</v-tab>
      <v-tab>Eleven</v-tab>
      <v-tab>Twelve</v-tab>
      <v-tab>Thirteen</v-tab>
      <v-tab>Fourteen</v-tab>
      <v-tab>Fifteen</v-tab>
      <v-tab>Sixteen</v-tab>
      <v-tab>Seventeen</v-tab>
      <v-tab>Eighteen</v-tab>
      <v-tab>Nineteen</v-tab>
      <v-tab>Twenty</v-tab>
                    </v-tabs>
                </v-main>
            </v-app>
        `
    })

    console.log(app)
}