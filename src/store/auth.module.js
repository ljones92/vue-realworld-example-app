import ApiService from "@/common/api.service";
import JwtService from "@/common/jwt.service";
import {
  LOGIN,
  LOGOUT,
  REGISTER,
  CHECK_AUTH,
  UPDATE_USER
} from "./actions.type";
import { SET_AUTH, PURGE_AUTH, SET_ERROR } from "./mutations.type";

const state = {
  errors: null,
  user: {},
  isAuthenticated: !!JwtService.getToken()
};

export const getters = {
  currentUser(state) {
    return state.user;
  },
  isAuthenticated(state) {
    return state.isAuthenticated;
  }
};

export const actions = {
  async [LOGIN](context, credentials) {
    try {
      const {
        data: { user = {} }
      } = await ApiService.post("users/login", { user: credentials });
      context.commit(SET_AUTH, user);
    } catch ({ response: { data: { errors = {} } = {} } = {} }) {
      context.commit(SET_ERROR, errors);
      throw new Error(errors);
    }
  },
  [LOGOUT](context) {
    context.commit(PURGE_AUTH);
  },
  async [REGISTER](context, credentials) {
    try {
      const {
        data: { user = {} }
      } = await ApiService.post("users", { user: credentials });
      context.commit(SET_AUTH, user);
    } catch ({ response: { data: { errors = {} } = {} } = {} }) {
      context.commit(SET_ERROR, errors);
      throw new Error(errors);
    }
  },
  async [CHECK_AUTH](context) {
    if (JwtService.getToken()) {
      ApiService.setHeader();

      try {
        const {
          data: { user = {} }
        } = await ApiService.get("user");
        context.commit(SET_AUTH, user);
      } catch ({ response: { data: { errors = {} } = {} } = {} }) {
        context.commit(SET_ERROR, errors);
        throw new Error(errors);
      }
    } else {
      context.commit(PURGE_AUTH);
    }
  },
  async [UPDATE_USER](context, payload) {
    const { email, username, password, image, bio } = payload;
    const user = {
      email,
      username,
      bio,
      image
    };
    if (password) {
      user.password = password;
    }

    try {
      const {
        data: { user: updatedUser = {} }
      } = await ApiService.put("user", user);
      context.commit(SET_AUTH, updatedUser);

      return user;
    } catch ({ response: { data: { errors = {} } = {} } = {} }) {
      context.commit(SET_ERROR, errors);
      throw new Error(errors);
    }
  }
};

export const mutations = {
  [SET_ERROR](state, error) {
    state.errors = error;
  },
  [SET_AUTH](state, user) {
    state.isAuthenticated = true;
    state.user = user;
    state.errors = {};
    JwtService.saveToken(state.user.token);
  },
  [PURGE_AUTH](state) {
    state.isAuthenticated = false;
    state.user = {};
    state.errors = {};
    JwtService.destroyToken();
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
