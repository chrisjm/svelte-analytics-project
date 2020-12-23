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
  import FilterControl from './FilterControl.svelte';
  import RadioToggleButton from './RadioToggleButton.svelte';

  interface LoginsByDay {
    day: string;
    users: number;
  }

  interface LoginsByOrg {
    org: string;
    users: number;
    index: number;
  }

  interface SelectOption {
    id: string;
    text: string;
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
      .sort(sorter({ value: 'index', descending: false }));
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

  // Create color scale based on orgs
  $: orgColors = scaleSequential(['red', 'blue']).domain([
    0,
    loginsByOrg?.length ?? 1,
  ]);
  let orgChartDimensions: BarChartDimension<LoginsByOrg>[] = [];

  // NOTE: Reactivity caused by `orgColors()` above.
  $: orgChartDimensions = [
    {
      name: (d) => d.org,
      value: (d) => d.users,
      color: (d) => orgColors(d.index),
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

  function updateFilter(event) {
    const { id, text } = event.detail;
    console.log(`${text} (${id})`);
  }

  // Hard-coded for now
  // TODO: Retrieve via API call
  let applicationOptions = [
    { id: 'all', text: 'All' },
    { id: '1', text: 'Omni' },
    { id: '2', text: 'Territory' },
  ];
  let dateRangeOptions = [
    { id: 'today', text: 'Today' },
    { id: 'yesterday', text: 'Yesterday' },
    { id: '7d', text: 'Last 7 Days' },
    { id: '14d', text: 'Last 14 Days' },
    { id: '30d', text: 'Last 30 days' },
    { id: 'custom', text: 'Custom' },
  ];

  // Generate `orgOptions` from `loginsByOrg`
  let orgOptions: SelectOption[] = [];
  $: {
    orgOptions = loginsByOrg?.map((d) => {
      return {
        id: d.index.toString(),
        text: d.org,
      };
    });
  }

  // Frequency Toggle Buttons
  // TODO: Hook up API endpoint
  let freqChecked = 'day';
  function updateFreq(event) {
    freqChecked = event.detail.id;
  }
</script>

<style>
</style>

<div class="flex flex-col bg-purple-25 md:px-4">
  {#if loaded}
    <div class="filterControls flex flex-col md:flex-row">
      <FilterControl
        id="apps"
        labelText="Applications"
        options={applicationOptions}
        on:updateFilter={updateFilter} />
      <FilterControl
        id="orgs"
        labelText="Organizations"
        options={orgOptions}
        on:updateFilter={updateFilter} />
      <FilterControl
        id="daterange"
        labelText="Date range"
        options={dateRangeOptions}
        on:updateFilter={updateFilter} />
    </div>

    <div
      class="flex justify-center space-x-2 mt-4 md:mt-0 md:justify-end md:px-8 md:top-14 md:relative md:z-10">
      <RadioToggleButton
        name="frequency"
        id="day"
        labelText="Day"
        checked={freqChecked === 'day' ? 'checked' : ''}
        on:click={updateFreq} />
      <RadioToggleButton
        name="frequency"
        id="week"
        labelText="Week"
        checked={freqChecked === 'week' ? 'checked' : ''}
        on:click={updateFreq} />
      <RadioToggleButton
        name="frequency"
        id="month"
        labelText="Month"
        checked={freqChecked === 'month' ? 'checked' : ''}
        on:click={updateFreq} />
    </div>

    <div class="charts mt-4 px-8 flex flex-col">
      <div class="h-48 md:h-72 w-full mt-4">
        <LineChart
          title="Logins By Day"
          dimensions={dayChartDimensions}
          data={loginsByDay}
          tooltipHeader={(d) => d.day}
          {xAxis} />
      </div>

      <div class="h-48 md:h-96 w-full mt-4">
        <HorizontalBarChart
          title="Active Users By Org"
          labels={(d) => d.org}
          dimensions={orgChartDimensions}
          data={loginsByOrg}
          labelAxis={orgChartLabelAxis} />
      </div>
    </div>
  {/if}
</div>
