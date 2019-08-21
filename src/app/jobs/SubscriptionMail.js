import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class SubscriptionMail {

  get key(){
    return 'SubscriptionMail'
  }
  async handle({ data }){

    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: "Novo subscriber",
      template: "subscription",
      context: {
        provider: meetup.User.name,
        user: user.name,
        date: format(parseISO(meetup.date), "'dia' dd 'de' MMMM', as' H:mm'h' ", {
          locale: pt,
        }),
        title: meetup.title,
      },
    });
  }
}

export default new SubscriptionMail();
