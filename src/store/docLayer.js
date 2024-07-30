import { defineStore } from "pinia";
import { ref } from "vue";

export const useDocLayerStore = defineStore("docLayer", () => {
  const noticeArray = ref([
    {
      content: "你好，东湖道路发生拥挤，请合理安排出行时间。",
      time: "2024-05-21 22:03",
      title: "关于碰撞事件的交通管制公告",
    },
    {
      content:
        "你好，在汤逊湖道路发生失火事件，请避开该道路行驶。祝你出行愉快！",
      time: "2024-05-21 22:05",
      title: "关于失火事件的交通管制公告",
    },
  ]);
  const pushNoticeArray = (item) => {
    noticeArray.value.push(item);
  };
  return { noticeArray, pushNoticeArray };
});
