<template>
  <el-table :data="tableData" max-height="528" @selection-change="handleSelectionChange">
    <template v-for="item in columnData" :key="item.prop">
      <el-table-column
          v-if="item.type"
          :type="item.type"
          :index="indexMethod"
          :label="item.label"
          :width="item.width"
          :align="item.align"
      />
      <el-table-column v-else :width="item.width" :align="item.align" :fixed="item.fixed" :show-overflow-tooltip="true">
        <!-- 表头  #header="scope" :value="scope.column" -->
        <template #header>
          <div v-if="item.label">{{ item.label }}</div>
          <slot v-else :name="item.labelSlot"></slot>
        </template>

        <!-- 列 -->
        <template #default="scope">
          <span v-if="item.prop && !item.slot">
            {{ item.formatter ? item.formatter(scope.row[item.prop]) ?? "-" : scope.row[item.prop] ?? "-" }}</span>
          <!-- 敏感信息需要特殊处理 -->
          <div v-else-if="item.prop && item.slot == 'sensitive' && scope.row[item.prop]">
            <div v-if="scope.row.sensitive == 'show'" class="flex between">
              <span>{{ scope.row[item.prop] }}</span>
              <el-tooltip placement="top" content="隐藏">
                <span @click="scope.row.sensitive = 'hide'"></span>
                <Menu class="table_icon" name="icon-show" @click="scope.row.sensitive = 'hide'"></Menu>
              </el-tooltip>
            </div>
            <div v-else class="flex between">
              <span>{{ changeToStar(scope.row[item.prop], 3, 4, "*") }}</span>
              <el-tooltip placement="top" content="显示">
                <Menu class="table_icon" name="icon-conceal" @click="scope.row.sensitive = 'show'"></Menu>
              </el-tooltip>
            </div>
          </div>

          <!-- 自定义列模板 -->
          <slot v-else :name="item.slot" :value="scope"></slot>
        </template>
      </el-table-column>
    </template>
    <template v-slot:empty>
      <div>暂无数据</div>
    </template>
  </el-table>
</template>

<script setup>
import {ref, watch} from "vue";
import {changeToStar} from "@/utils";

const props = defineProps({
  tableData: {
    type: Array,
    default: () => {
      return [];
    },
  },
  columnData: {
    type: Array,
    default: () => {
      return [];
    },
  },
  serial: {
    type: Number,
  },
});
const emit = defineEmits(["selection-change"]);
const handleSelectionChange = val => {
  emit("selection-change", val);
};

watch(
    () => props.tableData,
    val => {
      val.forEach(item => {
        if (!item["sensitive"]) {
          item["sensitive"] = "hide";
        }
      });
    },
    {deep: true, immediate: true}
);

// 序号
const indexMethod = index => {
  return index + props.serial;
};

// tooltip 展示
const tooltipShow = ref(true);
const onMouseEnter = e => {
  const parentWidth = e.target.offsetWidth; // 获取盒子宽度
  const contentWidth = e.target.children[0].offsetWidth; // 获取内容宽度
  tooltipShow.value = contentWidth >= parentWidth;
};
</script>

<style lang="less" scoped>
:deep(.el-table__header-wrapper) {
  .el-table__cell {
    background-color: #f4f7ff !important;
    height: 48px;
    padding: unset;
    color: #171717;
    font-weight: 400;

    .cell {
      line-height: unset;
      padding: 0 0 0 14px;

      .newLabelClass {
        margin-left: 5px;
        cursor: pointer;
      }
    }
  }
}

:deep(.el-table__body-wrapper) {
  .el-table__cell {
    height: 48px;
    padding: unset;
    color: #171717;
    font-weight: 400;

    .cell {
      white-space: nowrap;

      .el-tooltip__trigger {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.table_icon {
          width: 14px;
        }
      }

      .operateClass {
        padding: unset;
        height: 20px;
        border: unset;
        color: #4a82ff;
      }

      .table_icon {
        cursor: pointer;

        &:hover {
          color: #4a82ff;
        }
      }
    }
  }

  .el-table__empty-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 20px;
    padding: 32px 0;

    .imageClass {
      // height: 108px;
      // width: 108px;
      margin-bottom: 16px;
    }
  }
}

.flex {
  display: flex;
  justify-content: center;
  align-items: center;

  &.between {
    justify-content: space-between;
  }
}
</style>
