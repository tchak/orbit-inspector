import { Schema } from '@orbit/data';
import JSONAPISource from '@orbit/jsonapi';
import * as React from 'react';
import { render } from 'react-dom';

import createInspectorSource from './create-inspector-source';
import App from './components/app';

const schema = new Schema({
  models: {
    author: {
      attributes: {
        name: {
          type: 'string'
        },
        birthplace: {
          type: 'string'
        },
        dateOfBirth: {
          type: 'date'
        },
        dateOfDeath: {
          type: 'date'
        }
      },
      relationships: {
        books: {
          type: 'hasMany',
          model: 'book',
          inverse: 'author'
        },
        photos: {
          type: 'hasMany',
          model: 'photo'
        }
      }
    },
    book: {
      attributes: {
        title: {
          type: 'string'
        },
        isbn: {
          type: 'number'
        },
        datePublished: {
          type: 'date'
        }
      },
      relationships: {
        author: {
          type: 'hasOne',
          model: 'author'
        },
        chapters: {
          type: 'hasMany',
          model: 'chapter'
        },
        series: {
          type: 'hasOne',
          model: 'serie',
          inverse: 'books'
        },
        photos: {
          type: 'hasMany',
          model: 'photo'
        }
      }
    },
    serie: {
      attributes: {
        title: {
          type: 'string'
        }
      },
      relationships: {
        books: {
          type: 'hasMany',
          model: 'book',
          inverse: 'series'
        },
        photos: {
          type: 'hasMany',
          model: 'photo'
        }
      }
    },
    chapter: {
      attributes: {
        title: {
          type: 'string'
        },
        ordering: {
          type: 'number'
        }
      },
      relationships: {
        book: {
          type: 'hasOne',
          model: 'book',
          inverse: 'chapters'
        },
        photos: {
          type: 'hasMany',
          model: 'photo'
        }
      }
    },
    photo: {
      attributes: {
        title: {
          type: 'string'
        },
        uri: {
          type: 'string'
        }
      }
    }
  }
});

(async () => {
  const source = new JSONAPISource({
    schema,
    host: 'https://jsonapiplayground.reyesoft.com',
    namespace: 'v2'
  });
  const memory = await createInspectorSource(source);
  const element = document.getElementById('app');

  render(<App cache={memory.cache} />, element);

  seed(source);
})();

function seed(source: JSONAPISource) {
  for (let modelName in source.schema.models) {
    source.query(q => q.findRecords(modelName));
  }
}
