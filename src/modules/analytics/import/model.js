import { Import } from './import.model.js';
import Joi from 'joi';
const JoiDate = require('joi').extend(require('@joi/date'));

export const search_import_filter = Joi.object({
  type: Joi.string().max(50).allow(''),
  cush: Joi.string().max(255).allow(''),
  indian_port: Joi.string().max(255).allow(''),
  mode_of_shipment: Joi.string().max(100).allow(''),
  be_no: Joi.string().max(255).allow(''),
  be_date: Joi.string().max(50).allow(''),
  be_type: Joi.string().max(50).allow(''),
  month: JoiDate.date().format('YYYY-MM-DD').raw(),
  cth_hscode: Joi.string().max(255).allow(''),
  country_of_origin: Joi.string().max(255).allow(''),
  invoice_currency: Joi.string().max(100).allow(''),
  invoice_unit_price_fc: Joi.number().allow(''),
  quantity: Joi.number().allow(''),
  uqc: Joi.string().max(100).allow(''),
  unit_price: Joi.number().allow(''),
  total_ass_value: Joi.number().allow(''),
  total_duty_paid: Joi.number().allow(''),
  cha_name: Joi.string().max(255).allow(''),
  iec: Joi.string().max(255).allow(''),
  importer_name: Joi.string().max(255).allow(''),
  port_of_shipment: Joi.string().max(255).allow(''),
  supplier_name: Joi.string().max(255).allow(''),
  importer_city_state: Joi.string().max(255).allow(''),
  importer_pin: Joi.string().max(100).allow(''),
  importer_phone: Joi.string().max(255).allow(''),
  importer_mail: Joi.string().max(255).allow(''),
  importer_contact_person_1: Joi.string().max(255).allow(''),
  importer_contact_person_2: Joi.string().max(255).allow(''),
});

export const pagination = Joi.object({
  page_index: Joi.number().required(),
  page_size: Joi.number().required(),
});

export const duration = Joi.object({
  start_date: JoiDate.date().format('YYYY-MM-DD').raw().required(),
  end_date: JoiDate.date().format('YYYY-MM-DD').raw().required(),
});

export const search_import = Joi.object({
  search_text: Joi.string().min(3).max(70),
  filter: search_import_filter,
  pagination: pagination,
  duration: duration,
});

export async function batchInsertImportData(
  trx,
  insertRows,
  batchSize
){
  try {
    const data = await DB.write
      .batchInsert('import', insertRows, batchSize)
      .returning('id')
      .transacting(trx);

    console.log(`TOTAL RECORDS INSERTED IN IMPORT TABLE: ${data.length}`);
    // console.log(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('ERROR RASIED WHILE BATCH INSERTION IN IMPORT TABLE');
    throw error;
  }
}

export async function batchInsertImporterDetails(
  trx,
  insertRows,
  batchSize
) {
  try {
    const data = await DB.write
      .batchInsert('importer_details', insertRows, batchSize)
      .returning('id')
      .transacting(trx);

    console.log(
      `TOTAL RECORDS INSERTED IN importer_details TABLE: ${data.length}`
    );
    // console.log(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(
      'ERROR RASIED WHILE BATCH INSERTION IN importer_details TABLE'
    );
    throw error;
  }
}

export async function batchInsertSupplierDetails(
  trx,
  insertRows,
  batchSize){
  try {
    const data = await DB.write
      .batchInsert('supplier_details', insertRows, batchSize)
      .returning('id')
      .transacting(trx);

    console.log(
      `TOTAL RECORDS INSERTED IN supplier_details TABLE: ${data.length}`
    );
    return true;
  } catch (error) {
    console.error(
      'ERROR RASIED WHILE BATCH INSERTION IN supplier_details TABLE'
    );
    throw error;
  }
}

export async function dynamicImportSearch(params) {
  let DBQuery = DB.read.from('import');

  if (params.duration) {
    DBQuery = DBQuery.whereRaw(
      `month between '${params.duration.start_date}' and '${params.duration.end_date}'`
    );
  }

  if (params.filter) {
    if (params.filter.type) {
      DBQuery = DBQuery.where('type', params.filter.type);
    }
    if (params.filter.cush) {
      DBQuery = DBQuery.where('cush', params.filter.cush);
    }
    if (params.filter.indian_port) {
      DBQuery = DBQuery.where('indian_port', params.filter.indian_port);
    }
    if (params.filter.mode_of_shipment) {
      DBQuery = DBQuery.where(
        'mode_of_shipment',
        params.filter.mode_of_shipment
      );
    }
    if (params.filter.be_no) {
      DBQuery = DBQuery.where('be_no', params.filter.be_no);
    }
    if (params.filter.be_date) {
      DBQuery = DBQuery.where('be_date', params.filter.be_date);
    }
    if (params.filter.month) {
      DBQuery = DBQuery.where('month', params.filter.month);
    }
    if (params.filter.cth_hscode) {
      DBQuery = DBQuery.where('cth_hscode', params.filter.cth_hscode);
    }
    if (params.filter.country_of_origin) {
      DBQuery = DBQuery.where(
        'country_of_origin',
        params.filter.country_of_origin
      );
    }

    if (params.filter.invoice_currency) {
      DBQuery = DBQuery.where(
        'invoice_currency',
        params.filter.invoice_currency
      );
    }

    if (params.filter.invoice_unit_price_fc) {
      DBQuery = DBQuery.where(
        'invoice_unit_price_fc',
        params.filter.invoice_unit_price_fc
      );
    }
    if (params.filter.quantity) {
      DBQuery = DBQuery.where('quantity', params.filter.quantity);
    }
    if (params.filter.uqc) {
      DBQuery = DBQuery.where('uqc', params.filter.uqc);
    }

    if (params.filter.unit_price) {
      DBQuery = DBQuery.where('unit_price', params.filter.unit_price);
    }

    if (params.filter.total_ass_value) {
      DBQuery = DBQuery.where('total_ass_value', params.filter.total_ass_value);
    }

    if (params.filter.total_duty_paid) {
      DBQuery = DBQuery.where('total_duty_paid', params.filter.total_duty_paid);
    }

    if (params.filter.cha_name) {
      DBQuery = DBQuery.where('cha_name', params.filter.cha_name);
    }

    if (params.filter.iec) {
      DBQuery = DBQuery.where('iec', params.filter.iec);
    }

    if (params.filter.importer_name) {
      DBQuery = DBQuery.where('importer_name', params.filter.importer_name);
    }

    if (params.filter.importer_city_state) {
      DBQuery = DBQuery.where(
        'importer_city_state',
        params.filter.importer_city_state
      );
    }

    if (params.filter.importer_pin) {
      DBQuery = DBQuery.where('importer_pin', params.filter.importer_pin);
    }

    if (params.filter.importer_phone) {
      DBQuery = DBQuery.where('importer_phone', params.filter.importer_phone);
    }

    if (params.filter.importer_mail) {
      DBQuery = DBQuery.where('importer_mail', params.filter.importer_mail);
    }

    if (params.filter.importer_contact_person_1) {
      DBQuery = DBQuery.where(
        'importer_contact_person_1',
        params.filter.importer_contact_person_1
      );
    }

    if (params.filter.importer_contact_person_2) {
      DBQuery = DBQuery.where(
        'importer_contact_person_2',
        params.filter.importer_contact_person_2
      );
    }
  }

  if (params.search_text) {
    console.log(
      `SEARCHING IN IMPORT DATA WITH SEARCH TEXT ${params.search_text}`
    );
    if (params.filter) {
      if (params.filter.cth_hscode) {
        DBQuery = DBQuery.whereLike(
          'cth_hscode',
          `%${params.search_text || ''}%`
        );
      }

      if (params.filter.country_of_origin) {
        DBQuery = DBQuery.whereLike(
          'country_of_origin',
          `%${params.search_text || ''}%`
        );
      }

      if (params.filter.importer_name) {
        DBQuery = DBQuery.whereLike(
          'importer_name',
          `%${params.search_text || ''}%`
        );
      }
    }
  }

  const total_records = await DBQuery.clone().count();
  console.log(`FOUND ${total_records[0].count} SEARCH RESULT RECORDS`);

  if (params.pagination) {
    if (params.pagination.page_size) {
      const offset =
        (params.pagination.page_index || 0) * params.pagination.page_size;
      DBQuery = DBQuery.offset(offset).limit(params.pagination.page_size);
    }
  } else {
    DBQuery = DBQuery.offset(0).limit(20);
  }
  // console.log('IMPORT SEARCH QUERY: ', DBQuery.toSQL().toNative());
  const records = await DBQuery.clone().select('*');

  return {
    total_records: total_records[0].count,
    records,
  };
}
