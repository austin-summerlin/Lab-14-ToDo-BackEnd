import client from '../lib/client.js';
import supertest from 'supertest';
import app from '../lib/app.js';
import { execSync } from 'child_process';

const request = supertest(app);

describe('API Routes', () => {

  afterAll(async () => {
    return client.end();
  });

  describe('/api/todos', () => {
    let user;

    beforeAll(async () => {
      execSync('npm run recreate-tables');

      const response = await request
        .post('/api/auth/signup')
        .send({
          name: 'Person',
          email: 'person@user.com',
          password: 'uzer'
        });

      expect(response.status).toBe(200);

      user = response.body;
      console.log(user);
    });
    
    let chore = {
      id: expect.any(Number),
      task: 'Feed Cat',
      completed: false
    };

    // append the token to your requests:
    //  .set('Authorization', user.token);

    it('GET my /api/me/todos', async () => {

      const getTodoResponse = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send({
          task: 'Feed Cat',
          completed: false
        });

      expect(getTodoResponse.status).toBe(200);
      const chore = getTodoResponse.body;

      const response = await request.get('/api/me/todos')
        .set('Authorization', user.token);


      expect(response.status).toBe(200);
      expect(response.body).toEqual([chore]);

    });

    it('POST chore to /api/todos', async () => {
      const response = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send(chore);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        userId: user.id,
        ...chore
      });
      chore = response.body;
    });

    it('DELETE chore from /api/todos/:id', async () => {
      const newTodoResponse = await request
        .post('/api/todos')
        .set('Authorization', user.token)
        .send({
          task: 'Feed Cat',
          completed: true,
          userId: user.id
        });

      const newTodo = newTodoResponse.body;

      const response = await request.delete(`/api/todos/${newTodo.id}`)
        .set('Authorization', user.token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(newTodo);
    });

    it('UPDATE/PUT chore from /api/todos/:id', async () => {
      chore.completed = true;
      const response = await request
        .put(`/api/todos/${chore.id}/completed`)
        .set('Authorization', user.token)
        .send(chore);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(chore);
    });

  });
});