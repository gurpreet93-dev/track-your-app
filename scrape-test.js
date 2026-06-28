import gplay from 'google-play-scraper';

async function getReviews() {
  const result = await gplay.reviews({
    appId: 'com.wishabi.flipp',
    sort: gplay.sort.NEWEST,
    num: 10
  });

  console.log(`Fetched ${result.data.length} reviews:\n`);

  result.data.forEach((review, i) => {
    console.log(`${i + 1}. ${review.score}★ — ${review.userName}`);
    console.log(review.text);
    console.log('---');
  });
}

getReviews();