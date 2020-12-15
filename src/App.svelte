<script lang="typescript">
  import ky from 'ky';
  import sorter from 'sorters';
  import LineChart from './charts/LineChart.svelte';
  import HorizontalBarChart from './charts/HorizontalBarChart.svelte';
  import { scaleSequential } from 'd3-scale';
  import { interpolateSinebow } from 'd3-scale-chromatic';
  import type {
    AxisXOptions,
    LineChartDimension,
    BarChartDimension,
  } from './charts/dimensions';
  import dayjs from 'dayjs';

  interface LoginsByDay {
    day: string;
    users: number;
  }

  interface LoginsByOrg {
    org: string;
    users: number;
    index: number;
  }

  let loginsByDay: LoginsByDay[];
  let loginsByOrg: LoginsByOrg[];

  let loaded = false;
  async function load() {
    [loginsByDay, loginsByOrg] = await Promise.all([
      ky('/api/logins_by_day').json<LoginsByDay[]>(),
      ky('/api/logins_by_org').json<LoginsByOrg[]>(),
    ]);

    loginsByDay.sort(sorter('day'));
    loginsByOrg = loginsByOrg
      .map((d, i) => ({ ...d, index: i }))
      .sort(sorter('org'));
    console.log({ loginsByDay, loginsByOrg });
    loaded = true;
  }

  load();

  let dayChartDimensions: LineChartDimension<LoginsByDay>[] = [
    {
      x: 'day',
      y: 'users',
      color: () => 'red',
      name: () => 'Logins',
    },
  ];

  $: orgColors = scaleSequential(interpolateSinebow).domain([
    0,
    loginsByOrg?.length ?? 1,
  ]);
  let orgChartDimensions: BarChartDimension<LoginsByOrg>[] = [];
  $: orgChartDimensions = [
    {
      name: (d) => d.org,
      value: (d) => d.users,
      color: (data) => orgColors(data.index),
    },
  ];

  let xAxis: AxisXOptions;
  $: xAxis = {
    formatTick: (dayText) => {
      let d = dayjs(dayText);
      if (d.day() !== 0) {
        return '';
      }

      return d.format('MM-DD');
    },
    gridlines: (d) => dayjs(d).day() === 0,
  };

  let orgChartLabelAxis: AxisXOptions = {
    formatTick: (d) => truncate(d as string),
  };

  function truncate(s: string, size = 10) {
    if (s.length > size) {
      s = s.slice(0, size) + '...';
    }
    return s;
  }
</script>

<style>
</style>

<div class="h-screen w-screen p-16 flex-col space-y-4">
  {#if loaded}
    <div class="h-1/2 w-full">
      <LineChart
        title="Logins By Day"
        dimensions={dayChartDimensions}
        data={loginsByDay}
        tooltipHeader={(d) => d.day}
        {xAxis} />
    </div>

    <div class="h-1/2 w-full">
      <HorizontalBarChart
        title="Active Users By Org"
        labels={(d) => d.org}
        dimensions={orgChartDimensions}
        data={loginsByOrg}
        labelAxis={orgChartLabelAxis} />
    </div>
  {/if}
</div>
