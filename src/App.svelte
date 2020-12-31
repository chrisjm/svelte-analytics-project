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
  import Card from './Card.svelte';

  interface LoginsByDay {
    day: string;
    users: number;
  }

  interface LoginsByOrg {
    org_id: string;
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

  let appFilter = 'all';
  let orgFilter = 'all';
  let dateRangeFilter = '30d';

  let loaded = false;

  async function load() {
    [loginsByDay, loginsByOrg] = await Promise.all([
      ky('/api/logins_by_day', {
        searchParams: {
          app: appFilter,
          org: orgFilter,
          dateRange: dateRangeFilter,
        },
      }).json<LoginsByDay[]>(),
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

  // TODO: Fix redundancy
  function updateAppFilter(event) {
    appFilter = event.detail.id;
    load();
  }
  function updateOrgFilter(event) {
    orgFilter = event.detail.id;
    load();
  }
  function updateDateRangeFilter(event) {
    dateRangeFilter = event.detail.id;
    load();
  }

  // TODO: Retrieve via API call
  let applicationOptions = [
    { id: 'omni', text: 'Omni' },
    { id: 'tm', text: 'Territory' },
  ];

  // NB: Presets before custom datepicker implementation
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
        id: d.org_id.toString(),
        text: d.org,
      };
    });
  }

  // Frequency Toggle Buttons
  // TODO: Hook up to API endpoint
  let freqChecked = 'day';
  function updateFreq(event) {
    freqChecked = event.detail.id;
  }

  // Cards
  // NOTE: Hard-coded for now
  let cards = [
    {
      title: 'Active Users',
      value: 480,
      lastValue: 470,
      unit: 'users',
      time: 'last 7 days',
    },
    {
      title: 'Sessions',
      value: 2850,
      lastValue: 2504,
      unit: 'sessions',
      time: 'last 7 days',
    },
    {
      title: 'Time in App',
      value: 6.123,
      lastValue: 6.012,
      unit: 'min/s',
      time: 'avg',
    },
    {
      title: 'Reports',
      value: 45,
      lastValue: 67,
      unit: 'reports',
      time: 'last 7 days',
    },
  ];
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
        selected={appFilter}
        on:updateFilter={updateAppFilter} />
      <FilterControl
        id="orgs"
        labelText="Organizations"
        options={orgOptions}
        selected={orgFilter}
        on:updateFilter={updateOrgFilter} />
      <FilterControl
        id="daterange"
        labelText="Date range"
        options={dateRangeOptions}
        selected={dateRangeFilter}
        showAllOption={false}
        on:updateFilter={updateDateRangeFilter} />
    </div>

    <div
      class="flex flex-col space-y-4 space-x-0 mt-4 mx-2 md:mx-0 md:flex-row md:space-x-4 md:space-y-0">
      {#each cards as card}
        <Card
          title={card.title}
          value={card.value}
          lastValue={card.lastValue}
          unit={card.unit}
          time={card.time} />
      {/each}
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
