<template>
  <div>
    <div class="wrap">
      <label for="username">用户名</label>
      <input
        type="text"
        id="username"
        v-model="username"
        placeholder="请填写用户名"
        :class="user?'':'no'"
        @input="handleinput('user')"
      />
    </div>
    <div class="wrap">
      <label for="password">密码</label>
      <input
        type="password"
        id="password"
        v-model="password"
        placeholder="请填密码"
        :class="pass?'':'no'"
        @input="handleinput('pass')"
      />
    </div>
    <button class="login" @click="login">登录</button>
    <button class="nologin" @click="nologin">暂不登录</button>
  </div>
</template>

<script>
import md5 from "md5";
export default {
  data() {
    return {
      username: "",
      password: "",
      user: true,
      pass: true
    };
  },
  methods: {
    async login() {
      let { username, password } = this;
      //判断username password是否为空
      if (!username) {
        this.user = false;
      }
      if (!password) {
        this.pass = false;
      }
      if (username && password) {
        //登录
        password = md5(password);
        // console.log(password);
        let data = await this.$api.login({ username, password });
        data = data.data;
        if (data.token) {
          //存储token 跳转路由
          localStorage.setItem("token", data.token);
          this.$router.back(-1);
        }else{
          //提示错误
        }
      }
    },
    nologin() {
      this.$router.back(-1);
    },
    handleinput(name) {
      if (this[name]) return;
      this[name] = true;
    }
  }
};
</script>

<style scoped>
.wrap {
  padding: 0.2rem;
  display: flex;
  height: 0.5rem;
  background-color: white;
  align-items: center;
  border-bottom: 1px solid #f4f4f4;
  line-height: 0.5rem;
}
label {
  width: 1rem;
  height: 100%;
}
input {
  border: none;
  outline: none;
  flex: 1;
  height: 100%;
  padding-left: 0.2rem;
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
}
.login {
  margin-top: 0.2rem;
  width: 100%;
  height: 0.8rem;
  background-color: #237ed8;
  border: 1px solid #237ed8;
  color: white;
  font-size: 0.3rem;
}
.nologin {
  margin-top: 0.2rem;
  width: 100%;
  height: 0.8rem;
  background-color: #1fd59c;
  border: 1px solid #1fd59c;
  color: white;
  font-size: 0.3rem;
}
</style>