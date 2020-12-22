# Carevoyance - Interview Project

Attached you’ll find a few files:

* **test-interview-project.zip** - this is the project itself Unzip it, and checkout the README. Feel free to mess around in here, including the database, you can always reset it!
* **mockup.pdf** - this is a mockup — please don’t feel pressure to make it look exact — more like what types of fields we want and some basic interactions you can imagine an analytics user might want (switch dates, fields and charts change, etc).

We want you to build an analytics tool for internal use. No need to think about anything except for showing data to the user and let the user interact w/ the data, to wit:

* You should be able to toggle orgs (you can find them in the db in the `org` field), applications (`application`), date ranges (use the timestamp)
* The dashboards in the mockup are aggregations that need to take into account the filters from #1 - the actual values don’t matter so much, so make your best guess
* Check out the sample charts we attached — there a bunch more we included if you want to get fancy (we’re going to open source this library)
* There are two views — a responsive desktop-to-mobile view. The charts should automatically resize to the window, you can use tailwind to make it work well.
