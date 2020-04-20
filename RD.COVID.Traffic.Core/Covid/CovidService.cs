using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using Newtonsoft.Json;
using RD.COVID.Traffic.Core.Models;

namespace RD.COVID.Traffic.Core.Covid
{
    public class CovidService : ICovidService
    {
        /// <summary>
        /// Endpoints for Covid Data
        /// </summary>
        //private readonly string _latestCountryData = "https://covidapi.info/api/v1/country/{0}/latest";
        private readonly string _countryDataByDates = "https://covidapi.info/api/v1/country/{0}/timeseries/{1}/{2}";
        private readonly string _latestGlobalCount = "https://covidapi.info/api/v1/global/count";
        //private readonly string _globalCountByDates = "https://covidapi.info/api/v1/global/timeseries/{0}/{1}";

        /// <summary>
        /// Returns covid data
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <param name="country"></param>
        /// <returns></returns>
        public CovidData GetCovidData(DateTime startDate, DateTime endDate, string country)
        {
            var reqUrl = "";
            if (string.IsNullOrEmpty(country))
                return GetLatestGlobalCovidData();

            reqUrl = string.Format(_countryDataByDates, country, startDate.ToString("yyyy-MM-dd"), endDate.ToString("yyyy-MM-dd"));
            string jsonString = GetJsonData(reqUrl);
            return JsonConvert.DeserializeObject<CovidData>(jsonString);
        }

        /// <summary>
        /// returns latest Global Covid data
        /// </summary>
        /// <returns></returns>
        public CovidData GetLatestGlobalCovidData()
        {
            try
            {
                string jsonString = GetJsonData(_latestGlobalCount);
                var globalCovidData = JsonConvert.DeserializeObject<GlobalCovidData>(jsonString);
                var covidData = new CovidData();
                covidData.count = globalCovidData.Count;
                covidData.result = globalCovidData.Result.Select(x => new Result() { date = DateTime.Parse(x.Key), confirmed = x.Value.confirmed, deaths = x.Value.deaths, recovered = x.Value.recovered });
                return covidData;
            }
            catch (Exception ex)
            {
                //in case of exception log it
                return new CovidData();
            }
        }


        /// <summary>
        /// Get JSON data
        /// </summary>
        /// <param name="requestUrl"></param>
        /// <returns></returns>
        private string GetJsonData(string requestUrl)
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpResponseMessage response = client.GetAsync(requestUrl).Result;
            if (response.IsSuccessStatusCode)
            {
                return response.Content.ReadAsStringAsync().Result;
            }
            else
            {
                return response.ReasonPhrase;
            }
        }
    }
}