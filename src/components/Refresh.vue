<template>
  <div class="wrap">
    <div class="loading">
      <div :class="canRefesh?'loadingWrap loadingWrap0':'loadingWrap'" v-show="loadingOrText">
        <div class="short"></div>
        <div class="middle"></div>
        <div></div>
        <div class="middle"></div>
        <div class="short"></div>
      </div>
      <div class="textend"  v-show="!loadingOrText">加载完成</div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default{
  name:"Loading",
  props:["loading","changeLoading"],
  data(){
    return {
      timer:[],
      auto:true,
      translateY:0,
      wrap:null,
      loadingWrap:null,
      canRefesh:false,
      loadingOrText:true,
      load:true
    }
  },
  methods:{
    //获取元素样式的函数
    getStyle(ele,styleName){
      if(ele.currentStyle){
        return parseFloat(ele.currentStyle[styleName]);
      }else{
        return parseFloat(getComputedStyle(ele,null)[styleName]);
      }
    },
    animation(ele,dir){
      //定义速度和方向
      clearInterval(ele.timer);
      let oldHeight , newHeight , speed = 1;
      ele.timer = setInterval(() => {
        oldHeight = this.getStyle(ele,'height');
        newHeight = oldHeight + speed*dir;
        //判断边界
        if(newHeight<6 || newHeight>26){
          dir = -dir;
          newHeight = oldHeight + speed*dir;
        }
        ele.style.height = newHeight + "px";
      }, 1000/60);
      this.timer.push(ele.timer);
    },
    startani(){
      //先去除其内的div
      this.remove();
      //获取元素
      let divs = document.querySelectorAll(".loadingWrap div");
      for(let i=0 ; i<divs.length ; i++){
        i<=2?this.animation(divs[i],-1):this.animation(divs[i],1)
      }
    },
    endani(){
      this.canRefesh = false;
      this.loadingOrText = false;
      let divs = document.querySelectorAll(".loadingWrap div");
      for(let i=0 ; i<this.timer.length ; i++){
        clearInterval(this.timer[i]);
      }
      for(let i=0 ; i<divs.length ; i++){
        if(divs[i].className == "short"){
          divs[i].style.height = '17px';
        }else if(divs[i].className == "middle"){
          divs[i].style.height = '21px';
        }else{
          divs[i].style.height = '26px';
        }
      }
      setTimeout(() => {
        this.back(0,()=>{this.load = false;});
      }, 1000);
    },
    //返回时去除里面的div并且改变外面的背景颜色
    remove(){
      let ele = document.querySelector(".loadingWrap").children;
      for(let i=0 ; i<ele.length ; i++){
        if(ele[i].children.length){
          ele[i].children[0].remove();
        }
      }
    },
    //wrap返回的函数
    back(toY,callBack){
      let speed;
      let {wrap} = this;
      clearInterval(wrap.timerBack);
      wrap.timerBack = setInterval(() => {
        if(this.translateY>1){
          speed = this.translateY/10;
        }else{
          speed = .1;
        }
        this.translateY-=speed;
        if(this.translateY<=toY){
          this.translateY = toY;
          clearInterval(wrap.timerBack);
          this.loadingOrText = true;
          callBack&&callBack();
        }
        wrap.style.transform = "translateY("+this.translateY+"rem)";
      }, 1000/60);
    },
    //进页面自动刷新
    autoRefresh(){
      let {wrap} = this;
      //自动下滑
      clearInterval(wrap.timerdown);
      wrap.timerdown = setInterval(() => {
        this.translateY+=.1;
        if(this.translateY>=1){
          this.translateY = 1;
          clearInterval(wrap.timerdown);
          this.startani();
        }
        wrap.style.transform = "translateY("+this.translateY+"rem)";
      }, 1000/60);
    },
    //为元素添加子元素
    addChlid(ele,value){
      if(!ele.children.length){
        let div = document.createElement("div");
        div.style.width = '100%';
        div.style.height = value + "rem";
        div.style.backgroundColor = "#111310";
        div.style.borderRadius = "2px";
        ele.appendChild(div);
      }else{
        ele.children[0].style.height = value + "rem";
      }
    },
    //下拉刷新的函数
    pullRefresh(){
      //获取根元素字体大小
      let htmlFontSize = parseFloat(document.documentElement.style.fontSize);
      let [startX,startY] = [0,0];
      let isFirst , isX , startTranslateY;
      this.wrap.addEventListener("touchstart",(ev)=>{
        ev = ev || window.event;
        startX = ev.changedTouches[0].clientX;
        startY = ev.changedTouches[0].clientY;
        isFirst = true;
        isX = false;
        startTranslateY = this.translateY;
      })
      this.wrap.addEventListener("touchmove",(ev)=>{
        ev = ev || window.event;
        //获取元素相对视口的位置
        let top = this.wrap.getBoundingClientRect().top;
        let newY = ev.changedTouches[0].clientY;
        if(top<0){
          let newX = ev.changedTouches[0].clientX;
          startX = newX;
          startY = newY;
          return;
        }
        //进来判断是Y轴还是X轴
        if(isX || this.loading || this.load) return ;
        let reduceY = newY - startY;
        //一开始判断滑屏方向
        if(isFirst){
          isFirst = false;
          let newX = ev.changedTouches[0].clientX;
          let reduceX = newX - startX;
          if(Math.abs(reduceX)>=reduceY){
            isX = true;
            return;
          };
        }
        //1rem/htmlFontSize  =  ?/reduceY
        this.translateY += reduceY/htmlFontSize/4;
        startY = newY;
        //回到0以后不再向上滑
        if(this.translateY<=0){
          this.translateY = 0;
          isX = true;
        }
        this.wrap.style.transform = "translateY("+this.translateY+"rem)";
      })
      this.wrap.addEventListener("touchend",(ev)=>{
        ev = ev || window.event;
        if(this.translateY>1){
          //回到1rem的位置
          this.back(1,()=>{
            this.changeLoading();
            this.load = true;
          });
        }else if(this.translateY<1 && this.translateY>0){
          this.back(0);
          this.remove();
          this.canRefesh = false;
        }
      })
    }
  },
  mounted(){
    this.wrap = document.querySelector(".wrap");
    let timer = setInterval(()=>{
      if(!this.loading){
        clearInterval(timer);
        setTimeout(()=>{
          //获取视口的高度
          let winHeight = window.innerHeight;
          let height = this.wrap.offsetHeight;
          if(height<winHeight){
            this.wrap.style.height = winHeight + 'px';
          }
        },500)
      }
    })
    this.autoRefresh();
    this.pullRefresh();
  },
  watch:{
    loading(newValue,oldValue){
      newValue?this.startani():this.endani()
    },
    translateY(newValue,oldValue){
      if(newValue-oldValue>0 && newValue>=.5){
        //总长2.04   .5走完   newValue-0.5/0.5  =  length/2.04
        let length = (newValue-.5)*2.04/.5;
        let ele = document.querySelector(".loadingWrap");
        switch(true){
          case length<=.34:
            this.addChlid(ele.children[0],length);
            break;
          case length<=.76:
            this.addChlid(ele.children[1],length-.34);
            break;
          case length<=1.28:
            this.addChlid(ele.children[2],length-.76);
            break;
          case length<=1.7:
            this.addChlid(ele.children[3],length-1.28);
            break;
          case length<2.04:
            this.addChlid(ele.children[4],length-1.7);
            break;
          case length>=2.04:
            this.canRefesh = true;
            break;
        }
      }
      // if(newValue-oldValue<0 && newValue>=.5 && newValue<=1){
      //   //总长2.04   .5走完   1-newValue/0.5  =  length/2.04
      //   //  走的距离   1-newValue
      //   // let length = (1-newValue)*2.04/.5;
      // }
    }
  }
}



</script>

<style scoped>
/*  #caccc9  灰色 */
  .wrap{
    width: 100%;
  }
  .loading{
    height: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loadingWrap{
    width: 35px;
    height: 26px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .loadingWrap div{
    width: 4px;
    height: .52rem;
    background-color: #caccc9;
    border-radius: 2px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .loadingWrap0 div{
    background-color: #111310;
  }
  .loadingWrap .middle{
    height: .42rem;
  }
  .loadingWrap .short{
    height: .34rem;
  }
  .textend{
    line-height: 26px;
    text-align: center;
    color: #111310;
  }
</style>
