<template>
  <div class="content" :style="contentStyle" ref="ScrollContent">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ["contentStyle","parentEle"],
  data() {
    return {
      translateY: 0,
      timer: null
    };
  },
  methods: {
    QuadEaseOut(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    addEvent() {
      let [oldX, oldY, isFirst, oldTime, isX, speed, maxHeight] = [
        null,
        null,
        null,
        null,
        null,
        null
      ];
      //为content添加一个滚动的效果
      let content = this.$refs.ScrollContent;
      content.addEventListener("touchstart", ev => {
        ev = ev || window.event;
          //获取盒子的高度
        let height = Number.parseFloat(content.offsetHeight);
        let heightP = null;
        // console.log(height);
        //获取视口的高度或者父元素的高度
        if(this.parentEle){
          heightP = content.parentNode.offsetHeight;
          content.parentNode.style.overflow = 'hidden';
        }else{
          heightP = window.innerHeight;
        }
        //计算最大滑动距离
        maxHeight = height - heightP;
        if(maxHeight<=0) return;
        //记录一开始的xy
        oldX = ev.changedTouches[0].clientX;
        oldY = ev.changedTouches[0].clientY;
        isFirst = true;
        isX = false;
        speed = 0;
        oldTime = new Date().getTime();
        //点击停止滑动
        clearInterval(this.timer);
      });
      content.addEventListener("touchmove", ev => {
        ev = ev || window.event;
        if (isX || maxHeight<=0) return;
        //获取新的xy
        let newY = ev.changedTouches[0].clientY;
        //第一次进来判断滑屏方向
        let reduceY = newY - oldY;
        if (isFirst) {
          isFirst = false;
          let newX = ev.changedTouches[0].clientX;
          let reduceX = Math.abs(newX - oldX);
          let reduceYAbs = Math.abs(reduceY);
          if (reduceX > reduceYAbs) {
            isX = true;
            return;
          }
        }
        let newTime = new Date().getTime();
        let reduceTime = newTime - oldTime;
        speed = reduceY / reduceTime;
        this.translateY += reduceY;
        //判断是否滑到顶部
        if (this.translateY >= 0) {
          this.translateY = 0;
          content.style.transform = "translateY(" + this.translateY + "px)";
          return;
        }
        //判断是否滑到底部
        if (Math.abs(this.translateY) >= maxHeight) {
          this.translateY = -maxHeight;
          content.style.transform = "translateY(" + this.translateY + "px)";
          return;
        }
        content.style.transform = "translateY(" + this.translateY + "px)";
        oldY = newY;
        oldTime = newTime;
      });
      content.addEventListener("touchend", () => {
        if(maxHeight<=0) return;
        if (Math.abs(speed) > 0.5) {
          //设置滑动变化距离
          let c = speed * 200;
          //设置初始值
          let b = this.translateY;
          //设置初始时间
          let t = 1;
          //设置持续时间
          let d = Math.abs(Math.ceil(speed * 30));
          //开启一个定时器让盒子自己滑动
          clearInterval(this.timer);
          this.timer = setInterval(() => {
            if (t > d) {
              clearInterval(this.timer);
            }
            this.translateY = this.QuadEaseOut(t, b, c, d);
            content.style.transform = "translateY(" + this.translateY + "px)";
            t++;
            //判断边界
            if (this.translateY >= 0) {
              this.translateY = 0;
              content.style.transform =
                "translateY(" + this.translateY + "px)";
              clearInterval(this.timer);
            }
            if (Math.abs(this.translateY) >= maxHeight) {
              this.translateY = -maxHeight;
              content.style.transform =
                "translateY(" + this.translateY + "px)";
              clearInterval(this.timer);
            }
          }, 1000 / 60);
        }
      });
    }
  },
  mounted(){
    this.addEvent();
  }
};
</script>

<style scoped>
.content {
  height: auto;
}
</style>