<template>
    <div ref="chartRef" :style="{ width: '700px', height: '400px' }"></div>
  </template>
  
  <script setup>
  import { ref, onMounted,defineProps } from 'vue';
  import * as echarts from 'echarts';
  const props = defineProps({
monthCount:Array,
});

  // 声明一个ref来引用DOM元素
  const chartRef = ref(null);
  
  // 在组件挂载后初始化ECharts
  onMounted(() => {
    const chartInstance = echarts.init(chartRef.value);
  
    // 配置ECharts图表
    const option = {
      title: {
        text: '按月份统计',
        textStyle:{//调整字体大小
            fontsize:14,
            fontWidth:500,
          }
      },
      grid:{
          left:40,//左边留白  用来显示X轴
          // right:0,
        },
      tooltip: {},
      xAxis: {
        type:"category",
        data: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
        axisTick:{//x轴数值居中
            alignWithLabel:true,
          },
      },
      yAxis: {
        splitLine:{
            lineStyle:{//Y轴上的虚线
              type:"dotted",
            }
          }
      },
      series:[
      {
        name: '事件数量',
        type: 'bar',
        data: props.monthCount
      },
      {
      name: '事件数量',
      type: 'line',
      data: props.monthCount
    }

      ] 
     
    };
  
    // 应用配置项
    chartInstance.setOption(option);
  
    // 添加窗口调整大小时自动重绘图表的功能
    window.addEventListener('resize', () => {
      chartInstance.resize();
    });
  
  
  });
  </script>