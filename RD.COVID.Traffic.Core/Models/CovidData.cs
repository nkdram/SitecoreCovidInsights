using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RD.COVID.Traffic.Core.Models
{
    /// <summary>
    /// Covid Info by date
    /// </summary>
    public class CovidData
    {
        public double count { get; set; }
        public IEnumerable<Result> result { get; set; }
    }

    /// <summary>
    /// Covid results
    /// </summary>
    public class Result
    {
        public int confirmed { get; set; }
        public int deaths { get; set; }
        public int recovered { get; set; }
        public DateTime date { get; set; }
    }
}