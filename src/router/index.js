import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import songList from "../views/SongList.vue";
import Login from "../views/Login.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },{
    path: "/songList/:uploader",
    name: "songList",
    component: songList
  },{
    path:"/login",
    name:"login",
    component:Login
  }
];

const router = new VueRouter({
  routes
});

export default router;
