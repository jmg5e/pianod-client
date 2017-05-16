import {PianodClientPage} from './app.po';

describe('pianod-client App', function() {
  let page: PianodClientPage;
  beforeEach(() => { page = new PianodClientPage(); });

  it('should display page', () => {
    page.navigateTo();
    expect(page).toBeTruthy();
    // expect(page.getParagraphText()).toEqual('app works!');
  });
});
