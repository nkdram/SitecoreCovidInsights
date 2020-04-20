import { Injectable } from "@angular/core";
import { Observable  } from "rxjs";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { catchError, map } from "rxjs/operators";

// Set the http options
const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" })
};


@Injectable()

/**
 * Service to call all the API
 */
export class AppService  {
  constructor(private http: HttpClient) {}

  /**
   * Function to handle error when the server return an error
   *
   * @param error
   */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message);
    } else {
      // The backend returned an unsuccessful response code. The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return Observable.throw(error);
  }

  /**
   * Function to extract the data when the server return some
   *
   * @param res
   */
  private extractData(res: Response) {
    console.log(res);    
    return res || {};
  }

  /**
   * Function to GET what you want
   *
   * @param url
   */
  public getWebSitesData(): Observable<any> {
    // Call the http GET
    return this.http.get('/api/CovidTrafficApp/CovidTrafficApp/GetWebsites').pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves Covid cases
   * @param postData 
   */
  public getCovidData(postData): Observable<any> {
    // Call the http Post
    return this.http.post("/api/CovidTrafficApp/CovidTrafficApp/GetCovidData",postData, httpOptions).pipe(
      map(this.extractData),
    catchError(this.handleError)
    );
  }
  /**
   * Retrieves xDB visit Data
   * @param postData 
   */
  public getXdbData(postData): Observable<any> {
    // Call the http pOst
    return this.http.post("/api/CovidTrafficApp/CovidTrafficApp/GetXDbData",postData, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  /**
   * Get Average xDbData
   * @param postData 
   */
  public getAvgXdbData(postData): Observable<any> {
    // Call the http pOst
    return this.http.post("/api/CovidTrafficApp/CovidTrafficApp/GetAvgXDbData",postData, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  /**
   * Get Keywords xDbData
   * @param postData 
   */
  public getKeywordsdbData(postData): Observable<any> {
    // Call the http pOst
    return this.http.post("/api/CovidTrafficApp/CovidTrafficApp/GetSearchKeywords",postData, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  
}