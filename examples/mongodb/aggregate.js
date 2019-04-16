// Returns the cumulative sums of packets per day. Useful for seeing if activity is increasing/decreasing serverwide.

db.getCollection('packets').aggregate([
  { $match :
      { _created_on :{ $gt: ISODate("2018-01-01T00:00:00.000Z")}}
  },
  { $group : {
      _id : { year: { $year: "$_created_on" } , month: { $month: "$_created_on" }, day: { $dayOfMonth: "$_created_on" }},
      count: { $sum: 1 }
  }},
  { $sort: { _id: 1 } }
  ])


  // Same as above, except per user, per device

  db.getCollection('packets').aggregate([
    { $match :
        { _created_on :{ $gt: ISODate("2018-01-01T00:00:00.000Z")}, apikey:"glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9", devid:"yourDevice001"}
    },
    { $group : {
        _id : { year: { $year: "$_created_on" } , month: { $month: "$_created_on" }, day: { $dayOfMonth: "$_created_on" }},
        count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
    ])

    // combines date to format for calendar

    db.getCollection('packets').aggregate([
        { $match :
            { _created_on :{ $gt: ISODate("2018-01-01T00:00:00.000Z")}, apikey:"glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9", devid:"yourDevice001"}
        },
        { $group : {
            _id : { date: { $dateToString: { format: "%Y-%m-%d", date: "$_created_on" } }},
            count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
        ])