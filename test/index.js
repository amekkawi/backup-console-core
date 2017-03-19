'use strict';

require('./spec/structs/BackupResultIdentifier.spec');
require('./spec/structs/BackupResultMeta.spec');
require('./spec/structs/BackupResultMetrics.spec');
require('./spec/structs/VerifyEmailRecipientsResult.spec');
require('./spec/structs/VerifyIdentifierResult.spec');

require('./spec/util/validate.spec');
require('./spec/util/client.spec');
require('./spec/util/date.spec');
require('./spec/util/email.spec');
require('./spec/util/logging.spec');
require('./spec/util/promise.spec');
require('./spec/util/errors.spec');

require('./spec/Config.spec');
require('./spec/Service.spec');
require('./spec/Services.spec');

require('./spec/services/DBService.spec');
require('./spec/services/QueueService.spec');
require('./spec/services/StorageService.spec');
require('./spec/services/ReceivingService.spec');
