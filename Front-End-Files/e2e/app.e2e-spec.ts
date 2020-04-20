import { ScLiveTrackingPage } from './app.po';

describe('sc-live-tracking App', () => {
  let page: ScLiveTrackingPage;

  beforeEach(() => {
    page = new ScLiveTrackingPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
