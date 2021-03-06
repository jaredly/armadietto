const Controller = require('./base');

class Users extends Controller {
  showForm () {
    if (!this.server._allow.signup) return this.errorPage(403, 'Forbidden');
    if (this.redirectToSSL()) return;
    this.renderHTML(200, 'signup.html', { params: this.params, error: null });
  }

  showDump () {
    if (this.redirectToSSL()) return;
    this.renderHTML(200, 'dump.html', { params: this.params, error: null });
  }

  async doDump (store) {
    try {
      if (this.request.fields) {
        await store.authenticate(this.request.fields);
        if (this.request.fields.action === 'Upload') {
          if (!this.request.files.zip || !this.request.files.zip.buf) {
            throw new Error('File upload failed');
          }
          await store.importDump(this.request.fields.username, this.request.files.zip.buf);
          this.renderHTML(200, 'dump.html', { params: this.params, message: 'Imported successfully' });
        } else {
          return this.response.end();
        }
      } else {
        await store.authenticate(this.params);
        store.dump(this.params.username, this.response);
      }
    } catch (error) {
      this.renderHTML(409, 'dump.html', { params: this.params, error });
    }
  }

  async register () {
    if (!this.server._allow.signup) return this.errorPage(403, 'Forbidden');
    if (this.blockUnsecureRequest()) return;

    try {
      await this.server._store.createUser(this.params);
      this.renderHTML(201, 'signup-success.html', { params: this.params });
    } catch (error) {
      this.renderHTML(409, 'signup.html', { params: this.params, error });
    }
  }
}

module.exports = Users;
