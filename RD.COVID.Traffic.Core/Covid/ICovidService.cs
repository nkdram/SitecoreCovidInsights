using RD.COVID.Traffic.Core.Models;
using System;

namespace RD.COVID.Traffic.Core.Covid
{
    public interface ICovidService
    {
        /// <summary>
        /// Returns Covid information per country between specific dates
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <param name="Country"></param>
        /// <returns></returns>
        CovidData GetCovidData(DateTime startDate, DateTime endDate, string Country);

        

        /// <summary>
        /// Get Latest Global data
        /// </summary>
        /// <returns></returns>
        CovidData GetLatestGlobalCovidData();
    }
}
