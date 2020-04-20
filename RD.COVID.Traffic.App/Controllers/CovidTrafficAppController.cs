using RD.COVID.Traffic.App.Models;
using RD.COVID.Traffic.Core.Covid;
using RD.COVID.Traffic.Core.XConnect;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;

namespace RD.COVID.Traffic.App.Controllers
{
    public class CovidTrafficAppController : ApiController
    {
        private ICovidService _covidService { get; set; }
        private IXDbDataService _xdbService { get; set; }

        public CovidTrafficAppController()
        {
            _covidService = new CovidService();
            _xdbService = new XDbDataService();
        }

        [System.Web.Http.HttpPost]
        public IHttpActionResult GetXDbData(CovidTrafficRequestData trafficRequestData)
        {
            //Get xdb visits
            return Ok(_xdbService.GetVisitDataBySite(trafficRequestData));
        }

        [System.Web.Http.HttpPost]
        public IHttpActionResult GetAvgXDbData(CovidTrafficRequestData trafficRequestData)
        {
            //Get averages xdb visits
            return Ok(_xdbService.GetAverageVisitDataBySite(trafficRequestData));
        }


        [System.Web.Http.HttpPost]
        public IHttpActionResult GetCovidData(CovidTrafficRequestData trafficRequestData)
        {
            //Get Covid records
            return Ok(_covidService.GetCovidData(trafficRequestData.StartDate, trafficRequestData.EndDate, trafficRequestData.CountryId));
        }


        [System.Web.Http.HttpPost]
        public IHttpActionResult GetSearchKeywords(CovidTrafficRequestData trafficRequestData)
        {
            //Get Covid records
            return Ok(_xdbService.GetSearchedKeywords(trafficRequestData));
        }

        [System.Web.Http.HttpGet]
        public IHttpActionResult GetWebsites()
        {
            //Get SC Websites
            return Ok(_xdbService.GetWebsites());
        }
    }
}
