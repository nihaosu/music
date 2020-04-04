<template>
  <div class="app">
    <router-view></router-view>
    <audio :src="currentSongInfo?currentSongInfo.audio:''" style="display:none;" ref="myAudio"></audio>
    <!-- 歌曲简条 -->
    <div class="box" ref="box">
      <div class="boxLeft">
        <img
          :src="currentSongInfo?currentSongInfo.img:'http://suzhengyao888.com:3000/images/timg.gif'"
        />
        <span
          class="noSong"
        >{{currentSongInfo?currentSongInfo.title+'-'+currentSongInfo.author:"纵享音乐,让生活充满品质"}}</span>
      </div>
      <div class="boxRight">
        <div :class="playState?playState===1?'play start':'play pause':'play playNo'" ref="play0"></div>
        <div :class="playState?'list listCan':'list listNo'" ref="list"></div>
      </div>
    </div>
    <!-- 歌曲盒子 -->
    <div :class="enterOrLeave?'songBox songEnter':'songBox songLeave'" ref="songBox">
      <!-- 背景图片 -->
      <img :src="currentSongInfo?currentSongInfo.img:''" />
      <!-- 歌曲信息 -->
      <div class="songInfo">
        <!-- 头部 -->
        <div class="top">
          <div class="back" ref="back"></div>
          <div class="middle">
            <span :class="!realIndex?'topActive':''">歌曲</span>
            <div class="fen"></div>
            <span :class="realIndex?'topActive':''">歌词</span>
          </div>
          <div></div>
        </div>
        <div class="swiper-song">
          <div class="swiper-wrapper">
            <!-- 歌曲信息及控制 -->
            <div class="swiper-slide">
              <div class="song">
                <img :src="currentSongInfo?currentSongInfo.img:''" />
                <h2>{{currentSongInfo?currentSongInfo.title:''}}</h2>
                <div>{{currentSongInfo?currentSongInfo.author:''}}</div>
                <div
                  class="sentence"
                >{{currentLyric.length?currentLyric[rowIndex].sentence.sentence:''}}</div>
                <div class="controlWrap">
                  <div class="progressWrap">
                    <div class="progressBar">
                      <div class="progressOuter">
                        <div class="controlDot"></div>
                        <div class="progressInner"></div>
                      </div>
                    </div>
                    <div class="progressTime">
                      <span>{{formatTime(currentTime)}}</span>
                      <span>{{formatTime(duration)}}</span>
                    </div>
                  </div>
                  <div class="control">
                    <div class="order"></div>
                    <div class="pre" ref="pre"></div>
                    <div :class="playState===1?'playC':'pauseC'" ref="play1"></div>
                    <div class="next" ref="next"></div>
                    <div class="controlList" ref="list0"></div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 歌词信息 -->
            <div class="swiper-slide">
              <div class="lyric">
                <!-- 歌词头部 -->
                <div class="title">{{currentSongInfo?currentSongInfo.title:''}}</div>
                <div>{{currentSongInfo?currentSongInfo.author:''}}</div>
                <!-- 歌词内容 -->
                <div class="lyricContent" ref="lyricContent">
                  <div class="swiper-lyric">
                    <div class="swiper-wrapper">
                      <div class="swiper-slide" v-for="(item,index) in currentLyric" :key="index">
                        <div v-if="rowIndex==index" class="wrap">
                          <div
                            class="word"
                            v-for="(word,index) in item.words"
                            :key="index"
                            ref="word"
                          >
                            <div v-text="word.content" class="wordLeft"></div>
                            <div v-text="word.content" class="wordRight"></div>
                          </div>
                        </div>
                        <span v-else>{{item.sentence.sentence}}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div :class="`bottomPlay ${playState===1?'':'bottomPause'}`" ref="play2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 播放列表 -->
    <div class="listBox" ref="listBox">
      <div class="localList" ref="localList">
        <div class="listHead">播放歌曲列表({{localSongList.length}})条</div>
        <Scroll :parentEle="true" :contentStyle="scrollStyle">
          <!-- 渲染本地的东西 -->
          <ul ref="ulist">
            <li 
            v-for="(item,index) in localSongList"
            :key="index"
            :id="item._id"
            :data-index="index"
            :class="localIndex == index?'songListActive':''"
            >
            {{item.name}}
            <span class="listAuthor">{{item.author}}</span>
            </li>
          </ul>
        </Scroll>
        <div class="listClose">关闭</div>
      </div>
    </div>
  </div>
</template>

<script>
import Swiper from "swiper";
import { mapState } from "vuex";
import Scroll from "./components/Scroll.vue";
export default {
  data() {
    return {
      translateY: 0,
      enterOrLeave: false,
      realIndex: 0,
      playState: 0,
      startState:false,
      rowIndex: 0,
      timer: null,
      sentenceTimer: null,
      isFirst:true,
      wordTimer: [],
      localSongList:[],
      localIndex:0,
      duration:0,
      currentTime:0,
      changeCurrent:false,
      canPlay:false,
      moveProgress:false,
      scrollStyle:{
        paddingBottom:'.9rem',
        paddingTop:'1rem'
      }
    };
  },
  methods: {
    //让box运动的函数
    moveBoxTo(to) {
      if (to === this.translateY) return;
      let speed = (to - this.translateY) / 15;
      let timer = setInterval(() => {
        this.translateY += speed;
        if (
          (speed > 0 && this.translateY >= to) ||
          (speed < 0 && this.translateY <= to)
        ) {
          this.translateY = to;
          clearInterval(timer);
        }
        this.$refs.box.style.transform =
          "translateY(" + this.translateY + "rem)";
      }, 1000 / 60);
    },
    //歌曲盒子的初始化
    songBoxInit() {
      let that = this;
      this.$mySwiperSongBox = new Swiper(".swiper-song", {
        on: {
          slideChange() {
            that.realIndex = this.realIndex;
          }
        }
      });
    },
    //歌词的初始化
    lyricInit() {
      //获取歌词盒子的高度
      let height =
        parseInt(this.getStyle(this.$refs.lyricContent, "height")) / 2;
      let that = this;
      this.$myLyric = new Swiper(".swiper-lyric", {
        direction: "vertical",
        slidesPerView: "auto",
        slidesOffsetAfter: height,
        freeMode:true,
        freeModeMinimumVelocity : 1
      });
    },
    //歌词的滚动
    wordScroll(sentence, index) {
      //每一句开始之前关闭之前的定时器,并将上一句定时器的数组清空
      for(let item of this.wordTimer){clearInterval(item);}
      this.wordTimer = [];
      //开始的索引
      sentence.currentIndex = 0;
      let words = this.currentLyric[index].words;
      //开启定时器检查音频的播放时间
      clearInterval(this.sentenceTimer);
      this.sentenceTimer = setInterval(() => {
        let ms = this.$refs.myAudio.currentTime * 1000;
        if(this.startState){
          this.startState = false;
          //改变当前字的索引
          for(let i=0 ; i<words.length ; i++){
            if(words[i].start<=ms){sentence.currentIndex = i;}
          }
          //把前面所有字的宽度给满
          for(let index = 0 ; index<sentence.currentIndex ;index++){
            let word = sentence[index];
            if(word){
              let width = parseFloat(this.getStyle(word, "width"));
              word.firstElementChild.style.width = width + "px";
              word.lastElementChild.style.width = 0 + "px";
            }
          }
        }
        let currentstart = words[sentence.currentIndex].start;
        //判断当前的毫秒数是否达到当前字的开始毫秒数
        if (ms >= currentstart) {
          //获取字的容器
          let word = sentence[sentence.currentIndex];
          let wordLeft = word.firstElementChild;
          let wordRight = word.lastElementChild;
          //获取右边的宽度
          let width = parseFloat(this.getStyle(word, "width"));
          //获取文字出现的时长
          let t = words[sentence.currentIndex].continued;

          //记录当前下标
          let currentIndex = sentence.currentIndex;
          // 一次走 .5px  x一次    t时间  走  width
          //2width次  t/(2*width)
          //开启一个定时器控制两边的宽度
          clearInterval(this.wordTimer[currentIndex]);
          this.wordTimer[currentIndex] = setInterval(() => {
            let leftWidth = parseFloat(this.getStyle(wordLeft, "width"));
            let RightWidth = parseFloat(this.getStyle(wordRight, "width"));
            if (leftWidth + 1 >= width || currentIndex + 1 < sentence.currentIndex ) {
              wordLeft.style.width = width + "px";
              wordRight.style.width = 0 + "px";
              clearInterval(this.wordTimer[currentIndex]);
              return;
            }
            //加大左边的宽度 减小右边的宽度
            wordLeft.style.width = leftWidth + 1 + "px";
            wordRight.style.width = RightWidth - 1 + "px";
          }, t / width);

          //令指针指向下一个字
          sentence.currentIndex++;
          if (sentence.currentIndex >= sentence.length) {
            clearInterval(this.sentenceTimer);
          }
        }
      });
    },
    //歌词的控制函数
    lyricControl(isFirst) {
      let currentTime = this.$refs.myAudio.currentTime;
      let {duration} = this;
      this.changeCurrent ? this.changeCurrent = false : null
      //控制进度条的增加
      if(!this.moveProgress){
        this.controlProgressBar();
        this.currentTime = currentTime;
      }
      if (currentTime >= duration) {
        //歌曲播放完毕
        //清除当前定时器
        clearInterval(this.timer);
        //播放下一首
        this.playNext();
        return;
      }
      if (isFirst) {
        this.$nextTick(() => {
          //为每个字添加滚动效果
          this.wordScroll(this.$refs.word, 0);
        });
      }
      //暂停后开始
      if(this.startState && !this.changeCurrent){
        //为后面的字继续加上效果
        this.wordScroll(this.$refs.word, this.rowIndex);
      }
      //判断当前播放时间是否到达该句的结束时间
      if (!this.currentLyric[this.rowIndex]) return;
      let rowEnd = this.currentLyric[this.rowIndex].sentence.end;
      if (currentTime * 1000 >= rowEnd && this.currentLyric[this.rowIndex + 1]) {
        //滑到下一行
        this.rowIndex = this.rowIndex + 1;
        let slidto = this.rowIndex > 3 ? this.rowIndex - 3 : 0;
        this.$myLyric.slideTo(slidto, 300);
        //为选中的行添加文字滚动效果
        this.$nextTick(() => {
          //为每个字添加滚动效果
          this.wordScroll(this.$refs.word, this.rowIndex);
        });
      }
    },
    //播放歌曲
    play(freshStart) {
      if(this.isFirst){
        this.isFirst = false;
        freshStart = true;
      }
      this.$refs.myAudio.play();
      this.playState = 2;
      //歌词的滚动
      clearInterval(this.timer);
      this.lyricControl(freshStart);
      // this.startState = false;
      this.timer = setInterval(this.lyricControl, 100);
    },
    //暂停歌曲
    pause() {
      clearInterval(this.timer);
      this.$refs.myAudio.pause();
      this.playState = 1;
      this.startState = true;
      //实现歌词的暂停
      //关闭每一句滚动的定时器
      clearInterval(this.timer);
      //关闭句子的定时器
      clearInterval(this.sentenceTimer);
      //关闭每一个字的定时器
      clearInterval(this.wordTimer[this.wordTimer.length - 1]);
    },
    playNext(){
      //查看本地的播放列表
      //从播放列表中随机取一个索引 改变当前的current _id
      let playList = JSON.parse(window.localStorage.getItem('songList'));
      let length = playList.length;
      let index = Number.parseInt(Math.random()*length);
      // console.log(index);
      this.localIndex = index;
      window.localStorage.setItem('currentIndex',index);
      let _id = playList[index]._id;
      if(_id === this.$store.state.current){
        //当前行的索引变为0
        this.rowIndex = 0;
        this.play(true);
        this.$myLyric.slideTo(0, 0);
        return;
      }
      this.$store.dispatch("changeCurrentA",_id);
    },
    formatTime(time){
      time = Math.round(time);
      let minutes = Number.parseInt(time/60) >= 10 ? '' + Number.parseInt(time/60) : '0' + Number.parseInt(time/60);
      let seconds = Number.parseInt(time%60) >= 10 ? '' + Number.parseInt(time%60) : '0' + Number.parseInt(time%60);
      return minutes+":"+seconds;
    },
    controlProgressBar(){
      let {progressInner,controlDot,progressBarWidth,currentTime,duration} = this;
      //求出进度的width
      let progressWidth = (currentTime/duration) * progressBarWidth;
      progressInner.style.width = progressWidth + 'px';
      controlDot.style.transform = 'translateX('+progressWidth+'px)';
    },
    changeProgressBar(){
      let {progressOuter,progressInner,controlDot,progressBarWidth} = this;
      //获取进度条距离左边的距离
      let offsetLeft = progressOuter.getBoundingClientRect().left;
      //为进度条添加事件
      progressOuter.addEventListener('touchmove',(ev)=>{
        ev = ev || window.event;
        this.moveProgress = true;
        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true
        let clientX = ev.changedTouches[0].clientX;
        let progress = clientX - offsetLeft <= 0 ? 0 : clientX - offsetLeft
        progress = progress >= progressBarWidth ? progressBarWidth : progress
        //设置进度条的进度
        progressInner.style.width = progress + 'px';
        controlDot.style.transform = 'translateX('+progress+'px)';
        //算出改变后当前的歌曲播放位置
        this.currentTime = (progress/progressBarWidth) * this.duration;
      });
      progressOuter.addEventListener('touchend',(ev)=>{
        ev = ev || window.event;
        let clientX = ev.changedTouches[0].clientX;
        let progress = clientX - offsetLeft <= 0 ? 0 : clientX - offsetLeft
        progress = progress >= progressBarWidth ? progressBarWidth : progress
        progressInner.style.width = progress + 'px';
        controlDot.style.transform = 'translateX('+progress+'px)';
        //算出改变后当前的歌曲播放位置
        this.currentTime = (progress/progressBarWidth) * this.duration;
        //将改变后的 currentTime 改为当前的播放位置

        //歌词中找到改变后的时间对应的句子  改变对应的 rowIndex
        let {currentLyric,currentTime} = this;
        let ct = currentTime*1000;
        //判断是不是第一句
        if(ct<currentLyric[0].start){
          this.rowIndex = 0;
        }else if(ct >= currentLyric[currentLyric.length-1].sentence.start){
          this.rowIndex = currentLyric.length-1;
        }else{
          //遍历数组
          for(let i=0 ; i<currentLyric.length  ; i++){
            //比较每一项的sentence的start 和 end
            if(ct >= currentLyric[i].sentence.start && ct < currentLyric[i+1].sentence.start){
              this.rowIndex = i;
              break;
            }
          }
        }
        //滑到对应的行数
        let slidto = this.rowIndex > 3 ? this.rowIndex - 3 : 0;
        this.$myLyric.slideTo(slidto, 300);
        //为该行的字添加效果
        this.$refs.myAudio.currentTime = this.currentTime;
        this.wordScroll(this.$refs.word, this.rowIndex);
        this.changeCurrent = true;
        this.moveProgress = false;
      })
    }
  },
  mounted() {
    //获取进度条的dom元素
    this.progressOuter = document.querySelector('.progressOuter');
    this.progressInner = document.querySelector('.progressInner');
    this.controlDot = document.querySelector('.controlDot');
    //外层的宽度
    let progressOuterWidth = this.progressOuter.offsetWidth;
    //控制点的宽度
    let controlDotWidth = this.controlDot.offsetWidth;
    this.progressBarWidth = progressOuterWidth - controlDotWidth;
    this.changeProgressBar();
    
    //检查当前路由
    if(this.$route.path != '/'){
      this.translateY = 1;
      this.$refs.box.style.transform = "translateY(" + this.translateY + "rem)";
    }
    //根据本地存储改变playState状态
    if(this.current){
      this.playState = 1;
      //从服务器获取数据并加入list
      this.$api.songInfo({_id:this.current}).then(res=>{
        let data = res.data;
        this.$store.commit('initListM',{data});
        this.$nextTick(() => {
          //当前行的索引变为0
          // this.play(true);
          //更新歌词swiper
          if (this.$myLyric) {
            this.$myLyric.updateSlides();
            this.$myLyric.updateSize();
            this.$myLyric.slideTo(0, 0);
          }
        });
      })
    }
    //播放暂停
    let addPlay = ele => {
      this.clickEle(ele, ev => {
        ev.stopPropagation();
        if (this.playState) {
          if (this.playState === 1) {
            this.play();
          } else {
            this.pause();
          }
        }
      });
    };
    addPlay(this.$refs.play0);
    addPlay(this.$refs.play1);
    addPlay(this.$refs.play2);

    //上一首  下一首
    this.clickEle(this.$refs.pre,()=>{
      let playList = JSON.parse(window.localStorage.getItem('songList'));
      let currentIndex = +window.localStorage.getItem('currentIndex');
      currentIndex = currentIndex - 1 < 0 ? playList.length - 1 : currentIndex - 1
      this.localIndex = currentIndex;
      window.localStorage.setItem("currentIndex",currentIndex);
      let _id = playList[currentIndex]._id;
      this.$store.dispatch("changeCurrentA",_id);
    });
    this.clickEle(this.$refs.next,()=>{
      let playList = JSON.parse(window.localStorage.getItem('songList'));
      let currentIndex = +window.localStorage.getItem('currentIndex');
      currentIndex = currentIndex + 1 > playList.length - 1 ? 0 : currentIndex + 1
      this.localIndex = currentIndex;
      window.localStorage.setItem("currentIndex",currentIndex);
      let _id = playList[currentIndex]._id;
      this.$store.dispatch("changeCurrentA",_id);
    });

    //列表进入
    let addList = (ele) => {
      this.clickEle(ele, ev => {
        ev.stopPropagation();
        //从本地存储中拿到数据
        this.localSongList = JSON.parse(window.localStorage.getItem('songList'));
        this.localIndex = +window.localStorage.getItem('currentIndex');
        if(this.playState){
          //弹出播放列表
          this.$refs.listBox.style.display = 'block';
          setTimeout(() => {
            this.$refs.listBox.style.opacity = 1;
            this.$refs.localList.style.bottom = 0;
          }, 20);
        }
      });
    }
    addList(this.$refs.list);
    addList(this.$refs.list0);
    //列表退出
    this.clickEle(this.$refs.listBox,(ev)=>{
      let className = ev.target.className;
      if(className.includes('listBox') || className == "listClose"){
        this.$refs.listBox.style.opacity = 0;
        this.$refs.localList.style.bottom = '-100%';
        setTimeout(() => {
          this.$refs.listBox.style.display = 'none';
        }, 500);
      }
    })
    
    //为播放列表中的li标签添加点击效果
    this.clickEle(this.$refs.ulist,(ev)=>{
      let [id,index] = [null,null];
      if(ev.target.nodeName.toLowerCase() == 'li'){
        id = ev.target.id;
        index = ev.target.dataset.index;
      }else if(ev.target.nodeName.toLowerCase() == 'span'){
        id = ev.target.parentNode.id;
        index = ev.target.parentNode.dataset.index;
      }
      if(!id) return;
      this.$store.dispatch('changeCurrentA',id);
      this.localIndex = index;
      window.localStorage.setItem('currentIndex',index);
    })
    
    //为盒子添加一个点击事件
    this.clickEle(this.$refs.box, () => {
      if (!this.playState) return;
      this.enterOrLeave = true;
    });
    //返回
    this.clickEle(this.$refs.back, () => {
      this.enterOrLeave = false;
    });
    this.songBoxInit();
    this.lyricInit();
    this.$refs.myAudio.addEventListener('canplay',()=>{
      //获取播放的时长
      this.duration = this.$refs.myAudio.duration;
      this.canPlay = true;
    })
  },
  computed: {
    ...mapState(["current", "list"]),
    currentSongInfo() {
      return this.list.find(item => {
        return item.songId === this.current;
      });
    },
    currentLyric() {
      if (!this.currentSongInfo) return [];
      return this.currentSongInfo.lyric;
    }
  },
  watch: {
    $route(to) {
      if (to.path === "/") {
        this.moveBoxTo(0);
      } else {
        this.moveBoxTo(1);
      }
    },
    //监听当前播放歌曲的变化
    current() {
      //当前行的索引变为0
      this.rowIndex = 0;
      this.canPlay = false;
      this.$nextTick(() => {
        let timer = setInterval(() => {
         if(this.canPlay){
           this.play(true);
           clearInterval(timer);
         }
        });
        //更新歌词swiper
        if (this.$myLyric) {
          this.$myLyric.updateSlides();
          this.$myLyric.updateSize();
          this.$myLyric.slideTo(0, 0);
        }
      });
    }
  },
  components: {
    Scroll
  }
};
</script>

<style scoped>
.app {
  height: 100%;
  overflow: hidden;
}
.box {
  height: 0.8rem;
  position: fixed;
  bottom: 1rem;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  padding: 0 0.2rem;
  background-color: white;
  font-size: 0.25rem;
  width: 100%;
  box-sizing: border-box;
  line-height: .8rem;
}
.noSong {
  color: #bfbfbf;
  height: 100%;
  white-space: nowrap;
  overflow-x: scroll;
}
.boxLeft{
  width: 75%;
}
.boxLeft,
.boxRight {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.boxLeft img {
  width: 0.76rem;
  height: 0.76rem;
  border-radius: 50%;
  overflow: hidden;
  margin: -0.4rem 0.2rem 0 0;
}

.play {
  margin-right: 0.3rem;
}
.list {
  margin-right: 0.1rem;
}
.playNo {
  background: url("./assets/playNo.png") no-repeat;
}
.start {
  background: url("./assets/playCan.png") no-repeat;
}
.pause {
  background: url("./assets/pause.png") no-repeat;
}
.listNo {
  background: url("./assets/SongListNo.png") no-repeat;
}
.listCan {
  background: url("./assets/SongListCan.png") no-repeat;
}
.play,
.list {
  width: 0.5rem;
  height: 0.5rem;
  background-size: 0.5rem 0.5rem;
}
.songBox {
  position: absolute;
  z-index: 10;
  top: 100%;
  left: 0;
  width: 100%;
  height: 100%;
  transition: top 0.2s ease-in;
  overflow: hidden;
  background: white;
}
.songEnter {
  top: 0;
}
.songLeave {
  top: 100%;
}
.songBox > img {
  width: 200%;
  height: 200%;
  object-fit: cover;
  filter: blur(20px);
}
.songInfo {
  position: absolute;
  left: 0;
  top: 0;
  background: rgba(67, 68, 70, 0.8);
  /* opacity: .8; */
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
.top {
  height: 0.5rem;
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.4rem;
}
.back {
  width: 0.5rem;
  height: 0.5rem;
  background: url("./assets/back.png") no-repeat;
  background-size: 0.5rem 0.5rem;
}
.middle {
  display: flex;
  height: 100%;
  width: 30%;
  justify-content: space-around;
  align-items: center;
  color: #858585;
}
.fen {
  height: 30%;
  border-left: 1px solid #858585;
}
.topActive {
  color: #bcbcbc;
}
.swiper-song {
  position: absolute;
  top: 1rem;
  bottom: 0;
  width: 100%;
}
.lyric {
  padding: 0 0.6rem;
  height: 100%;
  color: #bcbcbc;
}
.song {
  position: relative;
  color: #bcbcbc;
  width: 85%;
  height: 100%;
  margin: 0 auto;
}
.song img {
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
}
.song h2 {
  color: rgba(255, 255, 255, 0.85);
  padding: 0.2rem 0;
}
.lyric {
  padding: 0 0.3rem;
}
.title {
  font-size: 0.42rem;
  padding-bottom: 0.15rem;
}
.lyricContent {
  margin-top: 0.2rem;
  height: 72%;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.6) 5%,
    rgba(255, 255, 255, 1) 15%,
    rgba(255, 255, 255, 1) 85%,
    rgba(255, 255, 255, 0.6) 95%,
    rgba(255, 255, 255, 0) 100%
  );
  padding: 0.5rem 0;
}
.swiper-lyric {
  height: 100%;
  font-size: 0.3rem;
}
.swiper-lyric .swiper-slide {
  height: auto;
  line-height: 200%;
}
.wrap {
  display: flex;
  justify-content: flex-start;
  font-size: 0.45rem;
  user-select: none;
  flex-wrap: wrap;
}
.word {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.wordLeft {
  color: #20d69d;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  padding: 0.1rem 0;
}
.wordRight {
  color: white;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  white-space: nowrap;
  padding: 0.1rem 0;
}
.sentence {
  padding: 0.2rem 0;
  font-size: 0.32rem;
  color: white;
}
.controlWrap {
  position: absolute;
  bottom: 0.3rem;
  height: 2rem;
  width: 100%;
  box-sizing: border-box;
}
.control {
  height: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.control div {
  width: 0.5rem;
  height: 0.5rem;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.control .order {
  background-image: url("./assets/random.png");
}
.control .pre {
  background-image: url("./assets/pre.png");
}
.control .next {
  background-image: url("./assets/next.png");
}
.control .controlList {
  background-image: url("./assets/SongListNo.png");
}
.control .playC {
  width: 1rem;
  height: 1rem;
  background-image: url("./assets/startC.png");
}
.control .pauseC {
  width: 1rem;
  height: 1rem;
  background-image: url("./assets/pauseC.png");
}
.bottomPlay{
  margin-top: .2rem;
  width: .6rem;
  height: .6rem;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url("./assets/startC.png");
}
.bottomPause{
  background-image: url("./assets/pauseC.png");
}
.listBox{
  position: absolute;
  top: 0 ;
  z-index: 10;
  opacity: 0;
  transition: opacity .3s ease-in;
  width: 100%;
  height: 100%;
  display: none;
  background-color: rgba(0, 0, 0, .3);
  color: #333333;
}
.localList{
  position: absolute;
  width: 100%;
  height: 76%;
  bottom: -100%;
  background-color: white;
  transition: bottom .3s ease-in;
  /* border-top-left-radius: .3rem;
  border-top-Right-radius: .3rem; */
  overflow: hidden;
}
.listHead{
  position: absolute;
  top: 0;
  width: 100%;
  height: 1rem;
  line-height: 1rem;
  background-color: white;
  z-index: 15;
  padding: 0 .2rem;
  border-bottom: 1px solid #f4f4f4;
}
.songListActive,.songListActive .listAuthor{
  color: #20d69d;
}
.localList li{
  border-bottom: 1px solid #f4f4f4;
  padding: 0 .2rem;
  height: .8rem;
  line-height: .8rem;
}
.listAuthor{
  padding-left: .1rem;
  font-size: .2rem;
  color: #555555;
}
.listClose{
  height: .9rem;
  border-top: #f4f4f4;
  background-color: #fafafa;
  line-height: .9rem;
  text-align: center;
  position: absolute;
  bottom: 0;
  width: 100%;
}
.progressWrap {
  height: 1rem;
  color: rgba(255, 255, 255, .8);
}
.progressBar,.progressTime{
  display: flex;
  align-items: center;
  height: .5rem;
}
.progressOuter{
  width: 100%;
  background-color: rgba(255, 255, 255, .3);
  height: .04rem;
  border-radius: .02rem;
}
.controlDot{
  width: .2rem;
  height: .2rem;
  background-color: #e6f2ff;
  border-radius: 50%;
  margin-top: -.08rem;
}
.progressInner{
  background-color: #e6f2ff;
  width: 0;
  height: 100%;
  margin-top: -.12rem;
}
.progressTime{
  justify-content: space-between;
  font-size: .23rem;
}
</style>