import { HttpAcceptRep } from './http-accept-rep';

describe('HttpAcceptRep', () => {
  describe('find', () => {
    it('finds exact match', () => {

      const rep = HttpAcceptRep.by('text/*, text/html');

      expect(rep.find('text/html')).toBe(0);
      expect(rep.entries[0]).toEqual([1, 'text', 'html']);
    });
    it('finds wildcard subtype', () => {

      const rep = HttpAcceptRep.by('text/*, text/html');

      expect(rep.find('text/plain')).toBe(1);
      expect(rep.entries[1]).toEqual([1, 'text']);
    });
    it('finds wildcard type', () => {

      const rep = HttpAcceptRep.by('*/*, text/html');

      expect(rep.find('application/plain')).toBe(1);
      expect(rep.entries[1]).toEqual([1]);
    });
    it('finds wildcard by subtype wildcard', () => {

      const rep = HttpAcceptRep.by('*/*, text/*');

      expect(rep.find('text/*')).toBe(0);
      expect(rep.entries[0]).toEqual([1, 'text']);
    });
    it('finds match by subtype wildcard', () => {

      const rep = HttpAcceptRep.by('text/plain, text/*');

      expect(rep.find('text/*')).toBe(0);
      expect(rep.entries[0]).toEqual([1, 'text', 'plain']);
    });
  });
});
