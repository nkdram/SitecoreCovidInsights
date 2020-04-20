using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RD.COVID.Traffic.Core.Models
{
    /// <summary>
    /// XDb Keywords
    /// </summary>
    public class XdbKeywords
    {
        public string name { get; set; }
        public int value { get; set; }
        public IEnumerable<XdbKeywords> children { get; set; }
    }
}