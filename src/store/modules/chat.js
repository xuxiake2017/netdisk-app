import { GetFriendMessages } from '@/api/friendMessage'
import util from '@/utils/util'
import { GetAllFriendNotify } from '@/api/friendNotify'

function makeFriendMessages (friendId, commit, state) {
  // 获取消息
  if (!state.messagesMap.get(friendId)) {
    let messages = []
    state.friendMessagesAll.forEach(item => {
      let temp = {}
      if (friendId === item.friendId) {
        if (item.from !== friendId) {
          // 自己发送的消息
          temp.img = item.userAvatar
          temp.user = item.userName
          temp.mine = true
        } else {
          // 好友发送的消息
          temp.img = item.friendAvatar
          temp.user = item.friendName
          temp.mine = false
        }
        temp.date = util.formatDate.format(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss')
        temp.msg = item.content
        temp.fileId = item.fileId
        temp.id = item.id
        messages.push(temp)
      }
    })
    state.messagesMap.set(friendId, messages)
  }
  // 获取分页
  if (!state.paginationMap.get(friendId)) {
    let temp = {}
    temp['pageNum'] = 1
    temp['pageSize'] = 100
    state.paginationMap.set(friendId, temp)
  }
}
function receiveMessagesHandlerFunction (dispatch, state, receive) {
  const messageContent = receive['content']
  if (receive['type'] === 'FRIEND') {
    state.friendMessagesAll.push(messageContent)
    let friendIndex = null
    state.friendMessages.forEach((item, index) => {
      if (item.friendId === messageContent.friendId) {
        friendIndex = index
      }
    })
    if (friendIndex !== null) {
      state.friendMessages.splice(friendIndex, 1, messageContent)
    } else {
      state.friendMessages.push(messageContent)
    }
    let temp = {}
    temp.img = messageContent.friendAvatar
    temp.user = messageContent.friendName
    temp.mine = false
    temp.date = util.formatDate.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
    temp.msg = messageContent.content
    temp.fileId = messageContent.fileId
    let messages_ = state.messagesMap.get(messageContent.friendId)
    messages_.push(temp)
  } else if (receive['type'] === 'FRIEND_APPLY_FOR') {
    dispatch('GetAllFriendNotify')
  }
}

export default {
  state: {
    // 添加好友上拉列表显示标记
    addActionSheetShow: false,
    // 所有的聊天记录
    friendMessagesAll: [],
    // 与好友的消息列表（包含一条最新的消息）
    friendMessages: [],
    // 存放与单个好友的消息
    messagesMap: new Map(),
    // 存放分页信息
    paginationMap: new Map(),
    // 好友通知
    friendNotifies: []
  },
  mutations: {
    toggleAddActionSheetShow (state, val) {
      state.addActionSheetShow = val
    },
    SET_FRIEND_MESSAGES_ALL: (state, val) => {
      state.friendMessagesAll = val
    },
    SET_FRIEND_MESSAGES_ALL_ITEM: (state, val) => {
      state.friendMessagesAll.push(val)
    },
    SET_FRIEND_MESSAGES: (state, val) => {
      state.friendMessages = val
    },
    SET_FRIEND_MESSAGES_ITEM: (state, val) => {
      state.friendMessages.push(val)
    }
  },
  actions: {
    // 获取所有的聊天信息
    GetFriendMessages ({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        state.friendMessages.splice(0)
        GetFriendMessages(params).then(res => {
          const data = res.data
          let temp = new Map()
          commit('SET_FRIEND_MESSAGES_ALL', data)
          data.forEach(item => {
            const friendId = item.friendId
            const friend = temp.get(friendId);
            if (!friend) {
              temp.set(friendId, item)
            } else {
              if (item.createTime >= friend.createTime) {
                temp.set(friendId, item)
              }
            }
          })
          temp.forEach((value, key) => {
            commit('SET_FRIEND_MESSAGES_ITEM', value)
          })
          state.friendMessages.forEach(item => {
            makeFriendMessages(item.friendId, commit, state)
          })
          resolve()
        })
      })
    },
    // 获取当前对话的聊天信息
    GetDialogPagination ({ commit, state }, friendId) {
      return new Promise((resolve, reject) => {
        const data = state.paginationMap.get(friendId)
        if (data) {
          resolve(data)
        } else {
          resolve()
        }
      })
    },
    // 获取当前对话的分页
    GetDialogFriendMessages ({ commit, state }, friendId) {
      return new Promise((resolve, reject) => {
        const data = state.messagesMap.get(friendId)
        if (data) {
          resolve(data)
        } else {
          resolve()
        }
      })
    },
    // 收到好友消息进行处理
    ReceiveMessagesHandler ({ dispatch, commit, state }, receive) {
      console.log(receive)
      if (state.messagesMap.size === 0) {
        dispatch('GetFriendMessages')
      } else {
        receiveMessagesHandlerFunction(dispatch, state, receive)
      }
    },
    // 获取所有通知
    GetAllFriendNotify ({ dispatch, commit, state }) {
      return new Promise((resolve, reject) => {
        GetAllFriendNotify().then(res => {
          state.friendNotifies = res.data
          resolve()
        })
      })
    },
    // 更新聊天列表信息
    UpdateFriendMessages ({ dispatch, commit, state }, data) {
      state.friendMessages.forEach((item, index) => {
        if (item.friendId === data.friendId) {
          state.friendMessages.splice(index, 1, data)
        }
      })
    }
  },
  getters: {
    addActionSheetShow: state => state.addActionSheetShow,
    friendMessages: state => state.friendMessages,
    paginationMap: state => state.paginationMap,
    messagesMap: state => state.messagesMap,
    friendNotifies: state => state.friendNotifies
  }
}
