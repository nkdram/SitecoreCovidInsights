using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RD.COVID.Traffic.Core.Models
{
    /// <summary>
    /// XDB data
    /// </summary>
    public class XDbData
    {
        public int count { set; get; }
        public IEnumerable<XDbResult> Results { set; get; }
    }

    /// <summary>
    /// Visit based on country
    /// </summary>
    public class XDbResult
    {
        public DateTime Day { get; set; }
        public int VisitCount { get; set; }
        public string ScCountryCode { get; set; }
        public string IsoCountryName { get; set; }
        public string CountryName { get; set; }
    }
}