using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RD.COVID.Traffic.Core.Models
{
    /// <summary>
    /// Keywords Response
    /// </summary>
    public class XdbKeywordsReponse
    {
        public IEnumerable<XdbKeywords> Keywords { get; set; }
        public IEnumerable<XdbKeywords> TopKeywords { get; set; }
    }
}