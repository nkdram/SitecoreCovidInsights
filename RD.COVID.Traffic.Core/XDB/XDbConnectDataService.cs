using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using System.Web;
using RD.COVID.Traffic.App.Models;
using RD.COVID.Traffic.Core.Models;
using Sitecore.Xdb.Reporting;

namespace RD.COVID.Traffic.Core.XConnect
{
    /// <summary>
    /// XconnectData service
    /// </summary>
    public class XDbDataService : IXDbDataService
    {
        private readonly string _getCountryFactsByDate = @"select sum({3}) visits,Date, dk.DimensionKey from Fact_CountryMetrics Fc
                                                        join DimensionKeys DK on dk.DimensionKeyId = fc.DimensionKeyId
                                                        where Date between '{0}' and '{1}' {2}
                                                        group by dk.DimensionKey,Date
                                                        order by date asc";

        private readonly string _getFactsByDate = @"select sum({3}) visits,Date from Fact_CountryMetrics Fc
                                                        join DimensionKeys DK on dk.DimensionKeyId = fc.DimensionKeyId
                                                        where Date between '{0}' and '{1}' {2}
                                                        group by Date
                                                        order by date asc";

        private readonly string _getAverageVisitsByCountry = @"select avg({3}) visits, dk.DimensionKey from Fact_CountryMetrics Fc
                                                                join DimensionKeys DK on dk.DimensionKeyId = fc.DimensionKeyId
                                                                where Date between '{0}' and '{1}' {2}
                                                                group by dk.DimensionKey
                                                                order by visits desc";

        private readonly string _getReferringUrls = @"select dk.DimensionKey as URLS from [dbo].[Fact_ReferringSiteMetrics] RS
                                                join [dbo].[DimensionKeys] dk on rs.DimensionKeyId = dk.DimensionKeyId
                                                where (dk.DimensionKey like '%q=%' or dk.DimensionKey like '%p=%' or dk.DimensionKey like '%query=%' or dk.DimensionKey like '%wd=%')
                                                and Date between '{0}' and '{1}' {2}
                                                group by dk.DimensionKey";

        private readonly string _websites = "select * from SiteNames";

        /// <summary>
        /// GEt Average visits by country
        /// </summary>
        /// <param name="covidTrafficRequestData"></param>
        /// <returns></returns>
        public XDbData GetAverageVisitDataBySite(CovidTrafficRequestData covidTrafficRequestData)
        {
            DataTable dt; string advQuery = "";

            if (!string.IsNullOrEmpty(covidTrafficRequestData.SiteId))
                advQuery += $" and fc.SiteNameId = '{covidTrafficRequestData.SiteId}' ";

            if (!string.IsNullOrEmpty(covidTrafficRequestData.CountryId))
            {
                advQuery = $" and dk.DimensionKey = '{covidTrafficRequestData.CountryId}' ";
            }

            var dataType = GetDataType(covidTrafficRequestData.DataType);

            if (!string.IsNullOrEmpty(advQuery))
                dt = ExecuteXbQuery(string.Format(_getAverageVisitsByCountry, covidTrafficRequestData.StartDate.ToString("yyyy-MM-dd"), covidTrafficRequestData.EndDate.ToString("yyyy-MM-dd"), advQuery, dataType));
            else
                dt = ExecuteXbQuery(string.Format(_getAverageVisitsByCountry, covidTrafficRequestData.StartDate.ToString("yyyy-MM-dd"), covidTrafficRequestData.EndDate.ToString("yyyy-MM-dd"), "", dataType));

            return ConvertDataTabletoAverageXDbData(dt);

        }

        public XDbData GetVisitDataBySite(CovidTrafficRequestData covidTrafficRequestData)
        {
            DataTable dt; string advQuery = "", query = _getFactsByDate;

            if (!string.IsNullOrEmpty(covidTrafficRequestData.CountryId))
            {
                advQuery = $" and dk.DimensionKey = '{covidTrafficRequestData.CountryId}' ";
                query = _getCountryFactsByDate;
            }
            if (!string.IsNullOrEmpty(covidTrafficRequestData.SiteId))
                advQuery += $" and fc.SiteNameId = '{covidTrafficRequestData.SiteId}' ";

            if (!string.IsNullOrEmpty(advQuery))
                dt = ExecuteXbQuery(string.Format(query, covidTrafficRequestData.StartDate.ToString("yyyy-MM-dd"), covidTrafficRequestData.EndDate.ToString("yyyy-MM-dd"), advQuery, GetDataType(covidTrafficRequestData.DataType)));
            else
                dt = ExecuteXbQuery(string.Format(query, covidTrafficRequestData.StartDate.ToString("yyyy-MM-dd"), covidTrafficRequestData.EndDate.ToString("yyyy-MM-dd"), "", GetDataType(covidTrafficRequestData.DataType)));

            return ConvertDataTabletoXDbData(dt);
        }


        /// <summary>
        /// Returns formatted list of Search Domain and keywords
        /// </summary>
        /// <param name="covidRequestData"></param>
        /// <returns></returns>
        public XdbKeywordsReponse GetSearchedKeywords(CovidTrafficRequestData covidRequestData)
        {
            DataTable dt; string advQuery = ""; var keywords = new List<XdbKeywords>();var topKeywords = new List<XdbKeywords>();
            XdbKeywordsReponse response = new XdbKeywordsReponse();

            if (!string.IsNullOrEmpty(covidRequestData.SiteId))
                advQuery += $" and RS.SiteNameId = '{covidRequestData.SiteId}' ";

            if (!string.IsNullOrEmpty(advQuery))
                dt = ExecuteXbQuery(string.Format(_getReferringUrls, covidRequestData.StartDate.ToString("yyyy-MM-dd"), covidRequestData.EndDate.ToString("yyyy-MM-dd"), advQuery));
            else
                dt = ExecuteXbQuery(string.Format(_getReferringUrls, covidRequestData.StartDate.ToString("yyyy-MM-dd"), covidRequestData.EndDate.ToString("yyyy-MM-dd"), ""));

            if (dt == null || dt?.Rows.Count == 0)
                return response;

            var listUrls = dt.AsEnumerable().Select(x => x.Field<string>("URLS")).ToList();
            foreach (var url in listUrls)
            {
                try
                {
                    //Process Key words and Search urls
                    var uri = new Uri(url);
                    var domainName = uri.Host;
                    var queryDictionary = System.Web.HttpUtility.ParseQueryString(uri.Query);

                    if (queryDictionary.AllKeys.Contains("q") || queryDictionary.AllKeys.Contains("p") || queryDictionary.AllKeys.Contains("query") || queryDictionary.AllKeys.Contains("wd"))
                    {
                        var searchKeyword = ParsedQuery(queryDictionary);
                        if (!string.IsNullOrEmpty(searchKeyword))
                        {
                            XdbKeywords keywordDomain, searchword, topKeyword;
                            keywords = AddToList(keywords, new XdbKeywords() { name = domainName, value = 1 }, out keywordDomain);
                            //GetKeyword(url);
                            keywordDomain.children = AddToList(keywordDomain.children?.ToList(), new XdbKeywords() { name = searchKeyword, value = 1 }, out searchword);
                            //keywords = SetValue<XdbKeywords>(keywords.Where(x => x.name == domainName), x => { x.children = keywordDomain.children; }).ToList();
                            keywords.Where(x => x.name == domainName).ToList().ForEach(s => s.children = keywordDomain.children);

                            //Top Keywords
                            topKeywords = AddToList(topKeywords, new XdbKeywords() { name = searchKeyword, value = 1 }, out topKeyword);
                        }

                    }

                }
                catch (Exception)
                {
                    //log exception
                }
            }
            response.Keywords = keywords;
            response.TopKeywords = topKeywords.OrderByDescending(x=>x.value).Take(1000); //Take top 1000 search key words

            return response;

        }

        private string ParsedQuery(System.Collections.Specialized.NameValueCollection query)
        {
            string[] queries = { "q", "p", "query", "wd" };
            foreach (var q in queries)
            {
                var parsedQ = query.Get(q);
                if (!string.IsNullOrEmpty(parsedQ))
                    return parsedQ;
            }

            return "";
        }

        /// <summary>
        /// Get Data Type
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        private string GetDataType(string type)
        {
            if (string.IsNullOrEmpty(type))
                return "visits";
           switch (type.ToLower())
            {
                case "value":
                    return "value";
                case "visits":
                    return "visits";
                case "bounces":
                    return "bounces";
                case "views":
                    return "pageviews";
                case "timeonsite":
                    return "timeonsite";

                default:
                    return "pageviews";
            }
        }


        /// <summary>
        /// Add to list if doesn't exist - else update value
        /// </summary>
        /// <param name="keywordDataList"></param>
        /// <param name="keyword"></param>
        /// <returns></returns>
        private List<XdbKeywords> AddToList(List<XdbKeywords> keywordDataList, XdbKeywords keyword, out XdbKeywords existingItem)
        {
            if (keywordDataList == null)
            {
                keywordDataList = new List<XdbKeywords>();
                keywordDataList.Add(keyword);
                existingItem = keyword;
                return keywordDataList;
            }

            if (keywordDataList.Any(item => item.name == keyword.name))
            {
                existingItem = keywordDataList.Where(x => x.name == keyword.name).First();
                keywordDataList.Where(x => x.name == keyword.name).ToList().ForEach(x => x.value = ++x.value); //SetValue<XdbKeywords>(keywordDataList.Where(x => x.name == keyword.name), x => { x.value = ++x.value; }).ToList();
                return keywordDataList;
            }

            existingItem = keyword;
            keywordDataList.Add(keyword);
            return keywordDataList;
        }

        /// <summary>
        /// Set value
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="items"></param>
        /// <param name="updateMethod"></param>
        /// <returns></returns>
        private IEnumerable<T> SetValue<T>(IEnumerable<T> items, Action<T>
         updateMethod)
        {
            foreach (T item in items)
            {
                updateMethod(item);
            }
            return items;
        }


        /// <summary>
        /// Execute query in reporting DB.
        /// </summary>
        /// <param name="strQuery"></param>
        /// <returns></returns>
        private DataTable ExecuteXbQuery(string strQuery)
        {
            var provider = (ReportDataProvider)Sitecore.Configuration.Factory.CreateObject("reporting/dataProvider", true);
            var query = new ReportDataQuery(strQuery);
            string datasource = "reporting";
            ReportDataResponse response = provider.GetData(datasource, query, new CachingPolicy { NoCache = true });
            return response.GetDataTable();
        }

        /// <summary>
        /// Convert DT to custom objects
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        private XDbData ConvertDataTabletoXDbData(DataTable dt)
        {
            if (dt == null || dt?.Rows.Count == 0)
                return new XDbData();

            var xDbData = new XDbData();
            xDbData.count = dt.Rows.Count;
            DataColumnCollection columns = dt.Columns;

            if (columns.Contains("DimensionKey"))
            {
                xDbData.Results = dt.AsEnumerable().Select(row =>
                 new XDbResult
                 {
                     Day = row.Field<DateTime>("Date"),
                     VisitCount = row.Field<int>("visits"),
                     ScCountryCode = row.Field<string>("DimensionKey"),
                     CountryName = GetCountryName(row.Field<string>("DimensionKey")),
                     IsoCountryName = GetIsoCountryName(row.Field<string>("DimensionKey"))
                 }).ToList();
            }
            else
                xDbData.Results = dt.AsEnumerable().Select(row =>
                new XDbResult
                {
                    Day = row.Field<DateTime>("Date"),
                    VisitCount = row.Field<int>("visits"),
                    ScCountryCode = "ZZ",
                    CountryName = GetCountryName("ZZ"),
                    IsoCountryName = GetIsoCountryName("ZZ")
                }).ToList();
            return xDbData;
        }


        /// <summary>
        /// average visits between dates
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        private XDbData ConvertDataTabletoAverageXDbData(DataTable dt)
        {
            if (dt == null || dt?.Rows.Count == 0)
                return new XDbData();

            var xDbData = new XDbData();
            xDbData.count = dt.Rows.Count;
            xDbData.Results = dt.AsEnumerable().Select(row =>
                  new XDbResult
                  {
                      VisitCount = row.Field<int>("visits"),
                      ScCountryCode = row.Field<string>("DimensionKey"),
                      CountryName = GetCountryName(row.Field<string>("DimensionKey")),
                      IsoCountryName = GetIsoCountryName(row.Field<string>("DimensionKey"))
                  }).ToList();

            return xDbData;
        }

        /// <summary>
        /// Returns available websites
        /// </summary>
        /// <returns></returns>
        public IEnumerable<XdbWebSiteData> GetWebsites()
        {
            var dt = ExecuteXbQuery(_websites);

            return dt.AsEnumerable().Select(row => new XdbWebSiteData() { WebSiteId = row["SiteNameId"].ToString(), WebSiteName = row.Field<string>("SiteName") });
        }

        /// <summary>
        /// Returns country Name based on country code
        /// </summary>
        /// <param name="countryCode"></param>
        /// <param name="countryName"></param>
        /// <returns></returns>
        private string GetCountryName(string countryCode)
        {
            if (countryCode == "ZZ")
                return "Unknown Country";

            try
            {
                RegionInfo region = new RegionInfo(countryCode);
                return region?.EnglishName;
            }
            catch
            {
                return "Unknown Country";
            }
        }

        /// <summary>
        /// Three Digit Iso Code
        /// </summary>
        /// <param name="countryCode"></param>
        /// <returns></returns>
        private string GetIsoCountryName(string countryCode)
        {
            if (countryCode == "ZZ")
                return "Unknown Country";
            try
            {
                RegionInfo region = new RegionInfo(countryCode);
                return region?.ThreeLetterISORegionName;
            }
            catch
            {
                return "Unknown Country";
            }

        }


        /// <summary>
        /// Get Search Keywords
        /// </summary>
        /// <param name="strU"></param>
        /// <returns></returns>
        private static string GetKeyword(string strU)
        {
            Regex regKeyword = new Regex("(p|q|query|wd)=(?<keyword>.*?)", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            Match match = regKeyword.Match(strU);
            string keyword = match.Groups["keyword"].ToString();
            // Get the decoded URL
            string result = HttpUtility.UrlDecode(keyword);
            // Get the HTML representation
            result = HttpUtility.HtmlEncode(result);

            return result;

        }

    }
}