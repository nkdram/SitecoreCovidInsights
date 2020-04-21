using RD.COVID.Traffic.App.Models;
using RD.COVID.Traffic.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RD.COVID.Traffic.Core.XConnect
{
    public interface IXDbDataService
    {
        /// <summary>
        /// Get Data by Site
        /// </summary>
        /// <param name="startTime"></param>
        /// <param name="endTime"></param>
        /// <param name="site"></param>
        /// <returns></returns>
        XDbData GetVisitDataBySite(CovidTrafficRequestData covidTrafficRequestData );

        /// <summary>
        /// Get Data by Site
        /// </summary>
        /// <param name="startTime"></param>
        /// <param name="endTime"></param>
        /// <param name="site"></param>
        /// <returns></returns>
        XDbData GetAverageVisitDataBySite(CovidTrafficRequestData covidTrafficRequestData);

        /// <summary>
        /// Get WebSites
        /// </summary>
        /// <returns></returns>
        IEnumerable<XdbWebSiteData> GetWebsites();

        /// <summary>
        /// Returns set of frequently searched keywords based on sites
        /// </summary>
        /// <param name="covidRequestData"></param>
        /// <returns></returns>
        XdbKeywordsReponse GetSearchedKeywords(CovidTrafficRequestData covidRequestData);
        
    }
}