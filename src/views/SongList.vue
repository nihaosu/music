<template>
  <div>
    <header>
      <img src="../assets/back0.png" ref="back" />
      <div>{{this.$route.params.uploader+'的歌单'}}</div>
    </header>
    <Scroll>
      <ul class="songList" v-if="data">
        <li
          v-for="(item,index) in data"
          :key="item._id"
          :class="item._id===$store.state.current?'songSing':''"
          ref="eachSong"
          :data-index="index"
          :id="item._id"
        >
          <div class="index">{{index+1}}</div>
          <div class="NA">
            <h3>{{item.name}}</h3>
            <div>{{item.author}}</div>
          </div>
        </li>
      </ul>
    </Scroll>
  </div>
</template>

<script>
import Scroll from "../components/Scroll.vue";
export default {
  data() {
    return {
      data: null
    };
  },
  methods: {
    async initData() {
      let uploader = this.$route.params.uploader;
      let data0 = await this.$api.songList({ uploader });
      this.data = data0.data;
      if (!this.data.length) return;
      this.$nextTick(() => {
        //为每个Li绑定一个点击效果
        this.$refs.eachSong.forEach(ele => {
          this.spread(ele, ev => {
            //把当前列表替换为本地的播放列表
            let localSongList = JSON.parse(
              window.localStorage.getItem("songList")
            );
            if (
              this.$route.params.uploader !=
                window.localStorage.getItem("songListName") ||
              this.data.length != localSongList.length
            ) {
              window.localStorage.setItem(
                "songListName",
                this.$route.params.uploader
              );
              window.localStorage.setItem(
                "songList",
                JSON.stringify(this.data)
              );
            }
            window.localStorage.setItem(
              "currentIndex",
              ev.currentTarget.dataset.index
            );
            let _id = ev.currentTarget.id;
            //派发改变current的action
            this.$store.dispatch("changeCurrentA", _id);
          });
        });
      });
    }
  },
  mounted() {
    //为返回按钮添加点击事件
    this.clickEle(this.$refs.back, () => {
      this.$router.back();
    });
    this.initData();
  },
  components: {
    Scroll
  }
};
</script>

<style scoped>
header {
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
  height: 2rem;
  background: linear-gradient(
    to right bottom,
    rgb(50, 114, 119),
    rgb(77, 180, 187)
  );
  color: aliceblue;
}
header img {
  width: 0.55rem;
  height: 0.5rem;
  padding-left: 0.1rem;
  padding-top: 0.1rem;
}
header div {
  text-align: center;
  font-size: 0.55rem;
}
.songList {
  padding-bottom: 1rem;
  padding-top: 2rem;
}
.songList li {
  position: relative;
  overflow: hidden;
  padding: 0.1rem 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  border-left: 2px solid #fafafa;
}
.index {
  width: 1rem;
  font-size: 0.3rem;
  text-align: center;
  margin-right: 0.2rem;
}
.NA div {
  font-size: 0.24rem;
  margin-top: 0.05rem;
}
.songList .songSing {
  color: #1bd79c;
  border-left: 2px solid #1bd79c;
}
</style>