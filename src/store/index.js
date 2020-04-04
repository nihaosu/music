import Vue from "vue";
import Vuex from "vuex";
import api from "../api/api.js";

Vue.use(Vuex);
//计算时间
function computeTime(minute,second,minuteS){
  return minute*60*1000 + second*1000 + minuteS*10;
}

//处理歌词
function handleLyric(lyric){
  let arr = [];
  lyric.replace(/\[\d+:\d+\.\d+\].+/g,(row)=>{
    //对每一行进行处理 并添加到数组中
    //找出每一行的开始时间和持续时间以及每个字的开始时间和持续时间
    
    let obj = {
      sentence:{},
      words:[]
    };

    //获取最后一个时间
    let regLast = /\[(\d+):(\d+)\.(\d+)\]$/;
    let rowLast = regLast.exec(row);
    let lastRowTime = computeTime(rowLast[1],rowLast[2],rowLast[3]);
    //匹配时间加字
    let isFirst = true , sentence = '' , preTime = null , preContent = '';
    row.replace(/\[(\d+):(\d+)\.(\d+)\]([^\[]*)/g,(big,...arg)=>{
      let [minute,second,minuteS,content] = arg;
      let time = computeTime(minute,second,minuteS);
      if(isFirst){
        //记录每一句的开始时间和结束时间
        obj.sentence.start = time;
        obj.sentence.end = lastRowTime;
        isFirst = false;
      }else{
        let contentContinued = time - preTime;
        let wordsObj = {};
        preContent = preContent.replace(/ /g,'\xa0');
        wordsObj.content = preContent;
        wordsObj.start = preTime;
        wordsObj.continued = contentContinued;
        obj.words.push(wordsObj);
        if(!content) return;
      }
      [preTime,preContent] = [time,content];
      //得到每一句的歌词
      sentence += content;
    })
    obj.sentence.sentence = sentence;
    arr.push(obj);
  });
  return arr;
}

let songList = JSON.parse(window.localStorage.getItem('songList'));
let index = window.localStorage.getItem('currentIndex');
let current = songList ? songList[index]._id : '';

export default new Vuex.Store({
  state: {
    current,
    list:[]
  },
  mutations: {
    initListM(state,payload){
      let {data} = payload;
      data[0].lyric = handleLyric(data[0].lyric);
      state.list = data;
    },
    changeCurrentM(state,payload){
      let {_id,data} = payload;
      if(_id === state.current) return;
      state.current = _id;
      if(data){
        data = data[0];
        data.lyric = handleLyric(data.lyric);
        state.list = [...state.list,data];
      }
    }
  },
  actions: {
    async changeCurrentA({state,commit},_id){
      //查找state中是否有指定_id的歌曲
      let result = state.list.find(item=>item.songId === _id);
      if(result){
        commit('changeCurrentM',{_id});
      }else{
        //从服务器拉取数据并提交突变
        let {data} = await api.songInfo({_id});
        commit('changeCurrentM',{_id,data});
      }
    }
  },
  modules: {}
});
