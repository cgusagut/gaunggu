<template>
  <div class="pagination-block">
    <el-pagination
        :background="isShowPgBtnBg"
        layout="total,sizes,prev,pager,next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        @size-change="sizeChange"
        @current-change="currentChange"
        :pager-count="5"/>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
const props = defineProps({
  isShowPgBtnBg: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 0
  },
  pageSizes: {
    required: false,
    type: Array,
    default() {
      return [5,10, 20, 30, 40, 100]
    }
  }
})

// let currentPageStatus = ref(false)
// let currentPageNum = ref(null)
const emit = defineEmits(["sizeChange","currentChange"]);
// 当前页条数
const sizeChange = (val) => {
  emit("sizeChange", val)
  emit("currentChange", 1)
}

// 下一页
const currentChange = (val) => {
  emit("currentChange", val)
}

</script>

<style lang="less" scoped>
.pagination-block {
  display: flex;
  justify-content: right;
  align-items: center;

  .el-pagination__total {
    margin-right: 15px;
  }

  :deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
    background-color: var(--g-themeColor) !important;
    color: #fff;
  }

  :deep(.el-pagination.is-background .el-pager li) {
    background-color: transparent;
    font-weight: 400;
    color: #585858;
  }

  .el-pager li.active {
    color: var(--g-themeColor);
  }

  .el-pager li {
    font-size: 14px;
    font-weight: 400;
    color: #808080;
  }

  .el-pagination__sizes {
    height: 28px !important;
    line-height: 28px !important;

    .el-input__inner {
      height: 28px !important;
      line-height: 28px !important;
    }
  }

  :deep(.btn-prev) {
    background-color: transparent;
    color: #171717;

    .el-icon {
      font-size: 14px;
      font-weight: 400;
      color: #171717;
    }
  }

  :deep( .btn-next) {
    background-color: transparent;
    color: #171717;

    .el-icon {
      font-size: 14px;
      font-weight: 400;
      color: #171717;
    }
  }

  .el-pagination__total {
    color: #171717;
    font-weight: 400;
    font-size: 12px;
  }
}
</style>
