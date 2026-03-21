require('dotenv').config();
process.env.MONGODB_URI = 'mongodb://localhost:27017/rr-test-history';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const mongoose = require('mongoose');
let app, server, token, userId;

beforeAll(async () => {
  const mod = require('../server');
  app = mod.app; server = mod.server;
  const User = require('../models/User');
  const u = new User({ name:'Hist User', email:'hist@test.com', password:'pass123', isVerified:true });
  await u.save();
  userId = u._id;
  const login = await request(app).post('/api/auth/login').send({ email:'hist@test.com', password:'pass123' });
  token = login.body.token;
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
  if (server) server.close();
});

describe('History endpoints', () => {
  let itemId;

  it('returns empty history for new user', async () => {
    const res = await request(app).get('/api/history').set('Authorization','Bearer '+token);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('saves analysis to history after roast (seeded directly)', async () => {
    const Analysis = require('../models/Analysis');
    const doc = await Analysis.create({
      user: userId, filename:'test.pdf', ats_score:72,
      categories:{ contact_info:{score:80,comment:'Good'}, work_experience:{score:70,comment:'OK'},
        skills:{score:75,comment:'Fine'}, education:{score:80,comment:'Solid'},
        keywords:{score:65,comment:'Needs work'}, formatting:{score:70,comment:'OK'} },
      roast:'Test roast', fixes:['fix1','fix2','fix3','fix4','fix5'], strengths:['s1','s2','s3']
    });
    itemId = doc._id.toString();
  });

  it('returns history with saved item', async () => {
    const res = await request(app).get('/api/history').set('Authorization','Bearer '+token);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0].ats_score).toBe(72);
  });

  it('deletes a history item', async () => {
    const res = await request(app).delete('/api/history/'+itemId).set('Authorization','Bearer '+token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('confirms item is deleted', async () => {
    const res = await request(app).get('/api/history').set('Authorization','Bearer '+token);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('cannot delete another users item', async () => {
    const User = require('../models/User');
    const Analysis = require('../models/Analysis');
    const other = new User({ name:'Other', email:'other@test.com', password:'pass123', isVerified:true });
    await other.save();
    const doc = await Analysis.create({
      user: other._id, filename:'other.pdf', ats_score:60,
      categories:{ contact_info:{score:60,comment:'c'}, work_experience:{score:60,comment:'c'},
        skills:{score:60,comment:'c'}, education:{score:60,comment:'c'},
        keywords:{score:60,comment:'c'}, formatting:{score:60,comment:'c'} },
      roast:'r', fixes:['f','f','f','f','f'], strengths:['s','s','s']
    });
    const res = await request(app).delete('/api/history/'+doc._id).set('Authorization','Bearer '+token);
    expect(res.status).toBe(200);
    const check = await Analysis.findById(doc._id);
    expect(check).toBeTruthy();
  });
});
