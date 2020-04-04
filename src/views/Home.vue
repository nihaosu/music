<template>
  <div class="home">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <!-- 音乐馆页面 -->
        <div class="swiper-slide musicPage">
          <header>
            <span class="headFont">音乐馆</span>
          </header>
          <Scroll>
            <Refresh :loading="loading" :changeLoading="changeLoading">
              <ul class="classList">
                <li v-for="(item,index) in data" :key="index" @click="toSongList(item.uploader)">
                  <img :src="item.img" />
                  <span>{{item.uploader}}</span>
                </li>
              </ul>
            </Refresh>
          </Scroll>
        </div>
        <!-- 我的页面 -->
        <div class="swiper-slide">
          <header>
            <span class="headFont">我的</span>
          </header>
          <Scroll :contentStyle='contentStyleMy'>
            <div class='userInfo'>{{isLogin?userInfo.username:'未登录'}}</div>
            <!-- 歌曲的上传 -->
            <div class="wraper">
              <label for="songname" class="label">歌曲名</label>
              <input
                type="text"
                id="songname"
                v-model="songname"
                placeholder="请填写歌曲名"
                :class="song?'':'no'"
                @input="handleinput('song')"
              />
            </div>
            <div class="wraper">
              <label for="authorname" class="label">作者名</label>
              <input
                type="text"
                id="authorname"
                v-model="authorname"
                placeholder="请填写歌曲作者名"
                :class="author?'':'no'"
                @input="handleinput('author')"
              />
            </div>
            <input type="file" name="audio" id="audio"  @change="handleFile('audio')">
            <input type="file" name="lyric" id="lyric"  @change="handleFile('lyric')">
            <input type="file" name="img" id="img" @change="handleImg('img')">
            <input type="file" name="feng" id="feng" @change="handleImg('feng')">
            <label for="audio" :class="`uploadfile ${audio?'':'noUpload'}`">上传音频</label>
            <label for="lyric" :class="`uploadfile ${lyric?'':'noUpload'}`">上传歌词</label>
            <div class="imgwrap">
              <label for="img" :class="`uploadimg ${img?'':'noUpload'}`">
                <img v-if="imgSrc" :src="imgSrc" >
                <span v-else>上传歌曲封面</span>
              </label>
              <label for="feng" :class="`uploadimg ${feng?'':'noUpload'}`">
                <img v-if="fengSrc" :src="fengSrc" >
                <img v-else-if="userInfo&&userInfo.img" :src="userInfo.img" >
                <span v-else>上传歌单封面</span>
              </label>
            </div>
            <button ref="upload">点击上传</button>
            <button class="loginAgain" ref="loginAgain">重新登录</button>
          </Scroll>
        </div>
      </div>
    </div>
    <!-- 底部导航 -->
    <div class="tar">
      <dl ref="music">
        <dt :class="realIndex==0?'tar_icon music_select':'tar_icon music'"></dt>
        <dd :class="realIndex==0?'active':''">音乐馆</dd>
      </dl>
      <dl ref="my">
        <dt :class="realIndex==1?'tar_icon mine_select':'tar_icon mine'"></dt>
        <dd :class="realIndex==1?'active':''">我的</dd>
      </dl>
    </div>
  </div>
</template>

<script>
import Swiper from "swiper";
import Refresh from "../components/Refresh.vue";
import Scroll from "../components/Scroll.vue";
export default {
  name: "Home",
  data() {
    return {
      realIndex: 0,
      headText: "音乐馆",
      loading: true,
      data: [],
      translateY: 0,
      isLogin:false,
      userInfo:{},
      songname:'',
      authorname:'',
      song:true,
      author:true,
      audio:true,
      lyric:true,
      img:true,
      feng:true,
      fengSrc:'',
      imgSrc:'',
      fileList:{},
      contentStyle: {
        paddingBottom: "2rem"
      },
      contentStyleMy:{
        paddingTop: '1rem',
        paddingBottom: '2rem'
      }
    };
  },
  methods: {
    toSongList(uploader) {
      this.$router.push({ path: "/songList/" + uploader });
    },
    async initData() {
      let startTime = new Date().getTime();
      let data = await this.$api.songClass();
      let endTime = new Date().getTime();
      if(endTime - startTime < 500){
        let timer = setTimeout(() => {
          clearTimeout(timer);
          this.loading = false;
        }, 500);
      }else{
        this.loading = false;
      }
      this.data = data.data;
    },
    select(index) {
      if (index == this.realIndex) return;
      this.$mySwiper.slideTo(index, 0);
    },
    changeLoading() {
      this.loading = true;
      //重新加载数据
      this.initData();
    },
    //初始化页面事件
    initPage() {
      let that = this;
      this.$mySwiper = new Swiper(".swiper-container", {
        on: {
          slideChange() {
            that.realIndex = this.realIndex;
          }
        }
      });
      this.clickEle(this.$refs.music, () => {
        this.select(0);
      });
      this.clickEle(this.$refs.my, () => {
        this.select(1);
      });
    },
    //判断是否登录并获取用户信息
    async getUserInfo(){
      let token = localStorage.getItem('token');
      if(!token) return;
      let userInfo = await this.$api.getUserInfo({token});
      if(userInfo.data.err) {
        this.isLogin = false;
        return;
      };
      this.isLogin = true;
      this.userInfo = userInfo.data;
    },
    handleinput(name) {
      if (this[name]) return;
      this[name] = true;
    },
    handleFile(name){
      //获取对应的元素 改变label标签中的内容
      let label = document.querySelector('label[for='+name+']');
      let input = document.getElementById(name);
      if(!input.files[0]) return;
      label.innerText = input.files[0].name;
      this.fileList[name] = input.files[0];
      //改变验证状态
      this[name] = true;
    },
    handleImg(name){
      let label = document.querySelector('label[for='+name+']');
      let input = document.getElementById(name);
      if(!input.files[0]) return;
      this.fileList[name] = input.files[0];
      this[name] = true;
      //改变label标签中的内容 (预览图片)
      let url = window.URL.createObjectURL(input.files[0]);
      if(name == 'img'){
        this.imgSrc = url;
      }else{
        this.fengSrc = url;
      }
    },
    rules(){
      let flag = true;
      let {songname,authorname} = this;
      let {audio,lyric,img,feng} = this.fileList;
      if (!songname) { this.song = false; flag = false; }
      if (!authorname) { this.author = false; flag = false; }
      if (!audio) { this.audio = false; flag = false; }
      if (!lyric) { this.lyric = false; flag = false; }
      if (!img) { this.img = false; flag = false; }
      if(!this.userInfo.img && !feng){
        this.feng = false;
        flag = false;
      }
      return flag;
    }
  },
  created() {
    this.initData();
    // setTimeout(this.initData, 1000);
  },
  mounted() {
    this.initPage();
    this.getUserInfo();
    //上传
    this.clickEle(this.$refs.upload,(ev)=>{
      //判断是否登录
      if(!this.isLogin){
        this.$router.push('/login');
      }
      let canUpload = this.rules();
      if(canUpload){
        //将歌曲信息上传到服务器
        let {songname,authorname} = this;
        let formData = new FormData();
        formData.append('songname',songname);
        formData.append('authorname',authorname);
        formData.append('uploader',this.userInfo.username);
        //将fileList中的文件信息转化为formData数据
        for(let key in this.fileList){
          formData.append(key,this.fileList[key]);
        }
        //上传至服务器
        this.$api.upload(formData).then(res=>{
          if(res.data.success){
            //提示
            //清空输入的内容
            this.songname = '';
            this.authorname = '';
            this.imgSrc = '';
            //获取两个label标签
            let label0 = document.querySelector('label[for=audio]');
            label0.innerText = '上传音频';
            let label1 = document.querySelector('label[for=lyric]');
            label1.innerText = '上传歌词';
            //清空filelist
            this.fileList = {};
          }
        })
      }
    });
    this.clickEle(this.$refs.loginAgain,()=>{
      this.$router.push('/login');
    })
  },
  components: {
    Refresh,
    Scroll
  }
};
</script>

<style scoped>
.home {
  height: 100%;
  color: #111310;
}
.headFont {
  font-family: "黑体";
  font-size: 0.42rem;
  font-weight: bold;
  margin-left: 0.2rem;
}
header {
  position: absolute;
  z-index: 2;
  display: flex;
  height: 1rem;
  background-color: #fafafa;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.slideWrap {
  width: 100%;
  height: 100%;
}
.tar {
  position: fixed;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #f4f4f4;
  height: 1rem;
  width: 100%;
  z-index: 2;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: white;
  box-sizing: border-box;
}
.tar dl {
  width: 50%;
  text-align: center;
  font-size: 0.15rem;
  color: #bfbfbf;
}
.tar dt {
  height: 0.6rem;
}
.music {
  background: url("../assets/music.png") no-repeat;
  background-size: 0.65rem 0.65rem;
}
.music_select {
  background: url("../assets/music_select.png") no-repeat;
  background-size: 0.65rem 0.65rem;
}
.mine {
  background: url("../assets/mine.png") no-repeat;
  background-size: 0.5rem 0.5rem;
}
.mine_select {
  background: url("../assets/mine_select.png") no-repeat;
  background-size: 0.5rem 0.5rem;
}
.tar_icon {
  background-position: center center;
}
.active {
  color: #1bd79c;
}
.musicPage {
  overflow: hidden;
}
.swiper-container {
  height: 100%;
}
.classList {
  padding-bottom: 2rem;
  display: grid;
  justify-content: space-evenly;
  grid-template-columns: repeat(3, 30%);
}
.classList li {
  margin-top: 0.2rem;
  text-align: center;
  color: #555555;
}
.classList img {
  width: 95%;
  border-radius: 0.2rem;
}
.userInfo{
  width: 86%;
  margin: .2rem auto;
  border-radius: .1rem;
  height: 1rem;
  background-color: white;
  line-height: 1rem;
  padding-left: .35rem;
}
input[type=file]{
  display: none;
}
.wraper {
  padding: 0.2rem;
  display: flex;
  height: 0.5rem;
  background-color: white;
  align-items: center;
  border-bottom: 1px solid #f4f4f4;
  line-height: 0.5rem;
}
.label {
  width: 1rem;
  height: 100%;
  color: rgba(0, 0, 0, .85);
}
input[type=text] {
  border: none;
  outline: none;
  flex: 1;
  height: 100%;
  padding-left: 0.3rem;
  border-radius: 0.1rem;
  line-height: inherit;
}
::-webkit-input-placeholder {
  color: #bbb;
}
::-moz-placeholder {
  color: #bbb;
}
:-ms-input-placeholder {
  color: #bbb;
}
.no::-webkit-input-placeholder {
  color: #f00;
}
.no::-moz-placeholder {
  color: #bbb;
}
.no:-ms-input-placeholder {
  color: #bbb;
}
button {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  height: 0.8rem;
  background-color: #1fd59c;
  border: 1px solid #1fd59c;
  color: white;
  font-size: 0.3rem;
}
.uploadfile{
  display: block;
  padding: 0 .2rem;
  width: 100%;
  height: 1rem;
  line-height: 1rem;
  background-color: rgba(0, 0, 0, .01);
  box-sizing: border-box;
  border-radius: .1rem;
  margin-top: .1rem;
}
.imgwrap{
  display: flex;
  justify-content: flex-start;
}
.uploadimg{
  width: 2rem;
  height: 2rem;
  margin: .2rem;
  line-height: 2rem;
  border-radius: .2rem;
  background-color: rgba(0, 0, 0, .01);
}
.uploadimg img{
  width: 2rem;
  height: 2rem;
  border-radius: .2rem;
}
.noUpload{
  color: red;
}
.loginAgain{
  margin-top: .2rem;
}
</style>

