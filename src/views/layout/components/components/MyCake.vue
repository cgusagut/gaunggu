<template>
    <div ref="chartRef" :style="{ width: '668px', height: '500px' }"></div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import * as echarts from 'echarts';
const props = defineProps({
    accidentCount:Array,
});
console.log( props.accidentCount)

// 声明一个ref来引用DOM元素
const chartRef = ref(null);

// 在组件挂载后初始化ECharts
onMounted(() => {
    const chartInstance = echarts.init(chartRef.value);

    // 配置ECharts图表
    const option = {
        title: {
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },

        legend: {
            show: true,
            left: 'center',
            top: 'bottom',
            data: [
            ]
        },
        series: [
            {
                name: '事件数量',
                type: 'pie',
                radius: '70%',
                laybel:{
                    show:true,
                    fontSize:'100',
                    color: '#000' // 可选，设置字体颜色
                },
                data: [
                    { value: props.accidentCount[0], name: '碰撞' },
                    { value: props.accidentCount[1], name: '刮擦' },
                    { value: props.accidentCount[2], name: '其他' },
                    { value: props.accidentCount[3], name: '失火' },
                    { value:props.accidentCount[4], name: '翻车' },
                    { value: props.accidentCount[5], name: '碾压' },

                ]
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