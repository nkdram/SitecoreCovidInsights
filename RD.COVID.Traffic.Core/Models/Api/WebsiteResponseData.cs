using RD.COVID.Traffic.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RD.COVID.Traffic.App.Models
{
    /// <summary>
    /// Web Site data from XDB
    /// </summary>
    public class WebsiteData
    {
        public IEnumerable<XdbWebSiteData> WebSites { get; set; }
    }
}