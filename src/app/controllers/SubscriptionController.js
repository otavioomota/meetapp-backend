import { isBefore, parseISO, subHours } from "date-fns";
import { Op } from "sequelize";
import Subscription from "../models/Subscription";
import Meetup from "../models/Meetup";
import User from "../models/User";

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from "../../lib/Queue";

import Notification from "../schemas/Notification";

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll(
      {
        where: { user_id: req.userId },
      },
      {
        include: [
          {
            model: Meetup,
            where: {
              date: {
                [Op.gt]: new Date(),
              },
            },
            required: true,
          },
        ],
        order: [[Meetup, "date"]],
      }
    );

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [User],
    });

    if (req.userId === meetup.user_id) {
      return res
        .status(400)
        .json({ error: "User can not subscribe in his own meetup" });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: "Can not subcribe to past meetups" });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: meetup.id,
    });

    const user = await User.findByPk(req.userId);

    await Notification.create({
      content: `${user.name} acabou de se inscrever para sua Meetup "${meetup.title}"`,
      user: meetup.user_id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    })


    return res.json(subscription);
  }

  async delete(req, res) {
    const subscription = await Subscription.findByPk(req.params.id);

    if (isBefore(parseISO(subscription.date), new Date())) {
      return res
        .status(400)
        .json({ error: "Can not cancel past subscriptions" });
    }

    const checkHour = subHours(subscription.date, 2);

    if (isBefore(checkHour, new Date())) {
      return res.status(400).json({
        error: "Can not cancel the subscription 2 hours before it starts",
      });
    }

    await subscription.destroy();

    return res.json();
  }
}

export default new SubscriptionController();
