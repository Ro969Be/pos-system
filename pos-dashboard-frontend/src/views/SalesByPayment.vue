<template>
  <div class="payment-sales">
    <h3>💳 支払い方法別売上構成</h3>
    <v-chart :option="chartOption" autoresize style="height:400px" />
  </div>
</template>

<script>
import axios from "axios";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export default {
  name: "SalesByPayment",
  components: { VChart },
  data() {
    return {
      data: [],
    };
  },
  computed: {
    chartOption() {
      return {
        title: { text: "支払い方法別売上", left: "center" },
        tooltip: { trigger: "item", formatter: "{b}<br/>¥{c} ({d}%)" },
        legend: { bottom: 0 },
        series: [
          {
            name: "売上",
            type: "pie",
            radius: "60%",
            data: this.data,
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.3)" } },
          },
        ],
      };
    },
  },
  async mounted() {
    const { data } = await axios.get("/api/sales-payment");
    this.data = data.methods;
  },
};
</script>

<style scoped>
.payment-sales {
  padding: 10px;
}
</style>
