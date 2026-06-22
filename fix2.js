const fs = require('fs');
let code = fs.readFileSync('src/app/admin/marketing/popup-campaigns/create/page.tsx', 'utf8');

const injection = `      else if (redirectType === 'offers') computedUrl = '/promotions';
      else if (redirectType === 'coupon') computedUrl = '/promotions';
      else if (redirectType === 'contact') computedUrl = '/about';
      
      setFormData(prev => ({ ...prev, redirectUrl: computedUrl }));
    }
  }, [popupActionType, selectedTargetId, redirectType]);
`;

code = code.replace(/else if \(redirectType === 'contact'\) computedUrl = '\/about';/, injection);
fs.writeFileSync('src/app/admin/marketing/popup-campaigns/create/page.tsx', code);
console.log('Fixed useEffect closing bracket');
