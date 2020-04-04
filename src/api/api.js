import qs from "qs";
import Axios from "axios";
let baseUrl = 'http://suzhengyao888.com:3000';

let api = {
    songClass() {
        return Axios({
            method: "get",
            url:baseUrl + "/songClass"
        })
    },
    songList(data) {
        return Axios({
            method: "post",
            url:baseUrl + "/songList",
            data: qs.stringify(data)
        })
    },
    songInfo(data) {
        return Axios({
            method: 'post',
            url:baseUrl + '/songInfo',
            data: qs.stringify(data)
        })
    },
    login(data) {
        return Axios({
            method: 'post',
            url:baseUrl + '/users/login',
            data: qs.stringify(data)
        })
    },
    getUserInfo(data) {
        return Axios({
            method: 'post',
            url:baseUrl + '/users/getUserInfo',
            data: qs.stringify(data)
        })
    },
    upload(data){
        return Axios({
            method: 'post',
            url:baseUrl + '/users/upload',
            data: data,
            processData:false,
            contentType:false
        })
    }
}

export default api;