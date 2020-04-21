import { Component, OnInit } from '@angular/core';
import { SortHeaderState } from '@speak/ng-bcl/table';
import {AppService} from '../app.service';
import { NgxDateRangePickerOptions } from 'ngx-daterangepicker';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-chart-page',
  templateUrl: './chart-page.component.html',
  styleUrls: ['./chart-page.component.css'],
  providers: [AppService,DatePipe]
})
export class ChartPageComponent implements OnInit {

  Websites :{};

  SelectedData: {
    from:any,
    to:any
  };

  postData : {
    StartDate:any,
    EndDate : any,
    CountryId:any,
    SiteId:any,
    DataType:any
  };  

  dataTypes : any;

  stats :{
    currentCountry : any,
    currentCountryCode:any,
    covidCountryCode:any,
    covidStats:any,
    averageCovidVisit : any,
    averageBeforeCovidVisit:any
    visitPercentage:any,
    period : any
  }

  updateOptions: any;
  show: boolean;
  statsLoaded : boolean;

  constructor(private appService : AppService,private datePipe: DatePipe) { 
    
  }
  options: NgxDateRangePickerOptions;

  ngOnInit() {
    //Set start and end date during INIT
    
    this.show = false;
    //Data view
    this.dataTypes = [ 
      {value :"visits", data:"Visits"},
      {value :"views", data:"Views"},
      {value :"bounces", data:"Bounces"},
 // {value :"timeonsite", data:"TimeOnSite"},
      {value :"value", data:"Value"}];

    //Get Websites
    this.appService.getWebSitesData().subscribe((Websites: any) => { 
      let webSitesArr = []; 
      Websites.forEach(wdata=> {     
        if(wdata.WebSiteId!=0){
          webSitesArr.push(wdata);
        }
      });
      this.Websites = webSitesArr;
    });

    
    //Datepicker options
    this.options = {
        theme: 'default',
        labels: ['Start', 'End'],
        menu: [
            {alias: 'td', text: 'Today', operation: '0d'},
            {alias: 'tw', text: 'This Week', operation: '0w'},
            {alias: 'lw', text: 'Last Week', operation: '-1w'},
            {alias: 'tm', text: 'This Month', operation: '0m'},
            {alias: 'lm', text: 'Last Month', operation: '-1m'}
        ],
        dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dateFormat: 'yyyy-MM-dd',
        outputFormat: 'YYYY-MM-DD',
        startOfWeek: 0,
        outputType: 'object',
        date: {
            from: {
                year: 2020,
                month: 1,
                day: 22
            },
            to: {
                year: parseInt(this.datePipe.transform(new Date(), 'yyyy')) ,
                month:parseInt(this.datePipe.transform(new Date(), 'MM')),
                day: parseInt(this.datePipe.transform(new Date(), 'dd'))                
            }
        }
    };

    this.postData = {
      StartDate : '2020-01-22' ,//Pandemic start date -- 22nd January
      EndDate : this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      CountryId :"",
      SiteId : "",
      DataType :"views"
    };
    this.SelectedData = {
      from : this.postData.StartDate,
      to:this.postData.EndDate
    };
    this.stats ={
      averageBeforeCovidVisit : 0,
      averageCovidVisit : 0,
      currentCountryCode : 'ZZ',
      period : 0,
      currentCountry : 'Unknown Country',
      covidStats : {},
      visitPercentage: 0,
      covidCountryCode:''
    }
    this.statsLoaded = false;
    this.GetChartData("","");
    this.GetAverageVisit();    
  }

  chartOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            crossStyle: {
                color: '#999'
            }
        }
    },
    toolbox: {
        feature: {
            dataView: {show: true, readOnly: false},
            magicType: {show: true, type: ['line', 'line']},
            restore: {show: true},
            saveAsImage: {show: true}
        }
    },
    legend: {
        data: [ 'Sitecore Data','Active-Covid-Cases']
    },            
    calculable : true,
    xAxis : [
        {
            type: 'time',
            boundaryGap:false
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: 'Sitecor Data',            
            axisLabel: {
                formatter: '{value} visits'
            }
        },
        {
            type: 'value',
            name: 'Active-Covid-Cases',            
            axisLabel: {
                formatter: '{value} cases'
            }
        }
    ],
    series: [
        {
            name: 'Views',
            type: 'line',
        },
        {
            name: 'Active-Covid-Cases',
            type: 'line',
            yAxisIndex: 1
        }
    ]
};

  public GetChartData(countryIsoCode, scCountryCode){
    var strcountryId = "";
    if(countryIsoCode && countryIsoCode.length > 0)
      strcountryId =  countryIsoCode;
    else
      strcountryId = this.postData.CountryId;

    if(strcountryId.length > 3) //ISO country code max three characters. 
      strcountryId ='';

    var bodyStr = this.GetBodyString(this.postData.StartDate,this.postData.EndDate,this.postData.SiteId,strcountryId,this.postData.DataType);
    this.show = true;
    this.statsLoaded = false;
    this.appService.getCovidData(bodyStr).subscribe((covidData: any) => {       
      if(scCountryCode  && scCountryCode.length > 0)
        strcountryId = scCountryCode;
      else
        strcountryId = this.postData.CountryId;      

      bodyStr = this.GetBodyString(this.postData.StartDate,this.postData.EndDate,this.postData.SiteId,strcountryId,this.postData.DataType);
      this.appService.getXdbData(bodyStr).subscribe((xDbData: any) => {         
        //Prepare Covide Data
        var covidValues = [];
        covidData.result.forEach(cdata=> {     
          if(new Date(cdata.date) >= new Date(this.postData.StartDate) && new Date(cdata.date) <= new Date(this.postData.EndDate)){
            covidValues.push([
              cdata.date,
              cdata.confirmed - (cdata.recovered + cdata.deaths)
            ]);
          }    
         
        });
        if(covidData.result){
          this.stats.covidStats = covidData.result[covidData.result.length-1];
        }       

        var xDBValues = [];    
        //Prepare xDb Data
        xDbData.Results.forEach(xdata=> {   
          xDBValues.push([
            xdata.Day,
            xdata.VisitCount
          ]);
        });
        
        if(xDbData.Results){
          this.stats.currentCountryCode = xDbData.Results[xDbData.Results.length-1].ScCountryCode;
          this.stats.currentCountry = xDbData.Results[xDbData.Results.length-1].CountryName;
          this.GetBeforeAndAfterAverageVisits(this.stats.currentCountryCode);
        } 

        this.updateOptions = {
          yAxis:[{
                name: this.postData.DataType,            
                axisLabel: {
                    formatter: '{value} ' + this.postData.DataType
                }            
            },
            {            
                name: 'Active-Covid-Cases'
            }],
          series: [{data: xDBValues,name: this.postData.DataType},{ data: covidValues}],
          legend: { data: [ this.postData.DataType, 'Active-Covid-Cases'] }
        
        };
   
        this.show = false;
      });
    });

  }

  public GetBeforeAndAfterAverageVisits(countryId){
    var strcountryId = "";
    if(countryId)
      strcountryId = countryId;
    else
      strcountryId = this.postData.CountryId;

    if(strcountryId){
      var bodyStr = this.GetBodyString(this.postData.StartDate,this.postData.EndDate,this.postData.SiteId,strcountryId,this.postData.DataType);
      this.appService.getAvgXdbData(bodyStr).subscribe((averageVisits: any) => { 
        averageVisits.Results.forEach(avgData=> {
          this.stats.averageCovidVisit = avgData.VisitCount;
        });
        //Format 
        var postdateStart = new Date(this.postData.StartDate); 
        var postdateEnd = new Date(this.postData.EndDate); 
        var dateDiff = (postdateEnd.getTime() - postdateStart.getTime())/(1000 * 3600 * 24);
        var startOfCovid = new Date("2020-01-22");//Start of Covid Data
        this.stats.period = dateDiff;
        bodyStr = this.GetBodyString(this.datePipe.transform(startOfCovid.setDate(startOfCovid.getDate()-dateDiff), 'yyyy-MM-dd')
        ,this.datePipe.transform(new Date("2020-01-22"), 'yyyy-MM-dd'),this.postData.SiteId, strcountryId,this.postData.DataType);
        this.appService.getAvgXdbData(bodyStr).subscribe((averageVisits: any) => { 
          averageVisits.Results.forEach(avgData=> {
            this.stats.averageBeforeCovidVisit = avgData.VisitCount;
            this.statsLoaded = true;            
            this.stats.visitPercentage =  (((this.stats.averageCovidVisit - this.stats.averageBeforeCovidVisit)/this.stats.averageBeforeCovidVisit) * 100).toFixed(2)
          });
          
        });
  
      });
    } 
  }
  
  public GetAverageVisit(){
    //Form-Body-String
    var bodyStr = this.GetBodyString(this.postData.StartDate,this.postData.EndDate,this.postData.SiteId,this.postData.CountryId,this.postData.DataType);
    this.sortedData = [];
    var count = 0;
    this.appService.getAvgXdbData(bodyStr).subscribe((averageVisits: any) => { 
      averageVisits.Results.forEach(avgData=> {
        this.sortedData.push({
          id : ++count,
          country : avgData.CountryName,
          dailyvisits : avgData.VisitCount,
          countryCode : avgData.IsoCountryName,
          scCountryCode : avgData.ScCountryCode
        });
      })
      
    });
  }

  public getCountryDetails(countryIsoCode, scCountryCode){
    //Set selected Date
    if(this.SelectedData && this.SelectedData.from && this.SelectedData.to){
      this.postData.StartDate = this.SelectedData.from;
      this.postData.EndDate = this.SelectedData.to;
    }
    this.stats.covidCountryCode = countryIsoCode;
    this.stats.currentCountryCode = scCountryCode;
    this.GetChartData(countryIsoCode,scCountryCode);
  }
  
  private GetBodyString(startDate, endDate, siteId, countryId, dataType){
    let body = new URLSearchParams();
    body.set('StartDate', startDate);
    body.set('EndDate', endDate);
    body.set('SiteId', siteId);
    body.set('CountryId', countryId);
    body.set('DataType', dataType);
    return body.toString();
  }
  
  sortedData = [
    ];

    trackByItemId(id: string, header): number { return header.id; }

  onSortChange(sortState: SortHeaderState[]) {
    this.sortedData.sort((a, b) => {
      let result = 0;
      sortState.forEach(header => {
        if (result !== 0) {
          return;
        }
        if (a[header.id] < b[header.id]) {
          if (header.direction === 'asc') {
            result = -1;
          } else if (header.direction === 'desc') {
            result = 1;
          }
        } else if (a[header.id] > b[header.id]) {
          if (header.direction === 'asc') {
            result = 1;
          } else if (header.direction === 'desc') {
            result = -1;
          }
        }
      });
      return result;
    });
  }
  //{from: "2020-03-01", to: "2020-03-31"}
    submitData(){
    if(this.SelectedData.from && this.SelectedData.to){
      this.postData.StartDate = this.SelectedData.from;
      this.postData.EndDate = this.SelectedData.to;
    }

    //load Chart Data
    this.GetChartData(this.stats.covidCountryCode,this.stats.currentCountryCode);
    this.GetAverageVisit();
  }

}
